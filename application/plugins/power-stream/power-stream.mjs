import MQTT from '../../lib/mqtt-sh.mjs';
import { currentTimestamp } from '../../lib/helper.mjs'
import { v4 as uuidv4 } from 'uuid';

import Inverter, {
  PARAM_PV_POWER_POTENTIAL,
  PARAM_GRID_STATUS,
  ON_GRID,
  PARAM_GRID_POWER,
  PARAM_LOAD_POWER,
  PARAM_PV_POWER,
} from './devices/inverter.mjs';
import Tashmota from './devices/tashmota.mjs'

const CMD_STATUSES = {
  START: 'START',
  PENDING: 'PENDING',
  FAIL: 'FAIL',
  DONE: 'DONE',
  HOLD: 'HOLD',
}

const CMD_ACTIONS = {
  DEVICE_ON: 'DEVICE_ON',
  DEVICE_OFF: 'DEVICE_OFF',
}

class PowerStream {
  constructor(pg) {
    this.pg = pg
    this.mqtt = null
    this.inverter = new Inverter()
    this.sockets = new Tashmota(this.on_publish)
    this.cmd = null
    this.cmds = []
    this.grid_buffer = 2000 // W
  }

  initDevices = async () => {
    const query = await this.pg.query('SELECT * FROM devices');
    if (query) this.sockets.setDevices(query.rows)
  }

  getInvertor = async () => {
    const ip = process.env.LOGGER_IP
    const pv_potential = this.pvPotential()
    const pv_power = this.pvPower()
    const grid_status = this.isGrid()
    const grid_load = this.gridLoad()
    const load = this.homeLoad()

    return {
      ip,
      pv_power,
      pv_potential,
      load,
      grid_status,
      grid_load,
    }
  }

  getDevices = async () => {
    return Object.keys(this.sockets.devices).map(device => ({
      id: this.sockets.devices[device].id,
      device_name: this.sockets.devices[device].device_name,
      device_ip: this.sockets.devices[device].device_ip,
      active_power: this.sockets.devices[device].active_power,
      active_status: this.sockets.devices[device].active_status,
      max_power: this.sockets.devices[device].max_power,
      priority_group: this.sockets.devices[device].priority_group,
    }))
  }

  syncDb = () => {
    setInterval(() => {
      Object.keys(this.sockets.devices).map(device => {
        const item = this.sockets.devices[device]
        const str = `
          INSERT INTO devices (device_type, device_name, max_power, active_status, device_ip)
          VALUES ('socket', '${item.id}', ${item.max_power}, ${item.active_status}, '${item.device_ip}')
          ON CONFLICT (device_name)
          DO UPDATE SET 
          device_type = 'socket',
          max_power = ${item.max_power},
          active_status = ${item.active_status},
          device_ip = '${item.device_ip}'
        `;
        this.pg.query(str)
      })
      this.initDevices()
    }, 10000)    
  }

  isCmdExists = () => this.cmd && Object.keys(CMD_STATUSES).includes(this.cmd.cmd_status)

  clearCmd = () => {
    if (!this.isCmdExists()) return

    const { cmd_id } = this.cmd
    
    const index = this.cmds.findIndex(cmd => cmd.cmd_id === cmd_id);
    if (index > -1) {
      this.cmds.splice(index, 1);
    }
    this.cmd = null
  }

  runCmd = (device_name, action) => {
    if (!CMD_ACTIONS[action]) return
    
    const obj = {
      cmd_id: uuidv4(),
      device_name,
      action,
      cmd_status: CMD_STATUSES.PENDING,
      timestamp: currentTimestamp()
    }
    
    this.cmds.push(obj)
    
    this.cmd = this.cmds[0]
  }

  isCmdInProgress = () => {
    if (!this.isCmdExists()) return false
    if (this.cmd.cmd_status && [CMD_STATUSES.PENDING, CMD_STATUSES.START].includes(this.cmd.cmd_status)) return true

    return true
  }

  setCmdStatus = (status) => {
    if (!this.isCmdExists()) throw new Error('CMD does not exist')
    if (!CMD_STATUSES[status]) throw new Error('CMD status does not exist')
    this.cmd.cmd_status = status
  }

  // Process only Pending CMDs
  processCmd = () => {
    if (!this.isCmdExists()) return

    const { action, cmd_status, device_name } = this.cmd

    if (cmd_status !== CMD_STATUSES.PENDING) return

    const device = this.sockets.devices[device_name]

    // on device
    if (action === CMD_ACTIONS.DEVICE_ON) {
      device.start(() => {
        this.mqtt.publish(`mqtt/${device.id}/cmnd/Power`, '1')
      })
    }

    // of device
    if (action === CMD_ACTIONS.DEVICE_OFF) {
      device.stop(() => {
        this.mqtt.publish(`mqtt/${device.id}/cmnd/Power`, '0')
      })      
    }
    
    this.setCmdStatus(CMD_STATUSES.START)
  }

  checkCmdExecution = () => {
    if (!this.isCmdExists()) return
    if (!this.isCmdInProgress()) return
    const { action, cmd_status, device_name, timestamp } = this.cmd

    if (cmd_status !== CMD_STATUSES.START) return

    const device = this.sockets.devices[device_name]
    
    if (action === CMD_ACTIONS.DEVICE_ON && device.isDeviceOn()) {
      this.setCmdStatus(CMD_STATUSES.DONE)
      return
    }

    if (action === CMD_ACTIONS.DEVICE_OFF && !device.isDeviceOn()) {
      this.setCmdStatus(CMD_STATUSES.DONE)
      return
    }

    if ((currentTimestamp() - timestamp) > 1 * 60 * 1000) {
      this.setCmdStatus(CMD_STATUSES.FAIL)
      return
    }
  }

  checkCmdReset = () => {
    if (!this.isCmdExists()) return
    const { cmd_status } = this.cmd

    if (![CMD_STATUSES.FAIL, CMD_STATUSES.DONE].includes(cmd_status)) return
    this.clearCmd()
  }


  /**
   * PRIORIRY_GROUP ONE (Solar + Grid)
   * Grid On
   *    On device
   * Grid Off
   *    Off device
   *    HERE WILL BE SOLAR CONTROL
   */
  controlPriorityGroupOne = () => {
    const devices_group = this.sockets.getDevicesByPriorityGroup(1)

    Object.keys(devices_group).forEach(key => {
      const device = devices_group[key];
      if (this.isGrid() && !device.isDeviceOn()) {
        this.runCmd(device.id, CMD_ACTIONS.DEVICE_ON)
        return
      }
      
      if (!this.isGrid() && device.isDeviceOn()) {
        this.runCmd(device.id, CMD_ACTIONS.DEVICE_OFF)
        return
      }
    })
  }

  /**
   * PRIORIRY_GROUP TWO (Solar + Grid)
   * Grid On
   *    On device if PV power 33% of required capacity. Grid On
   *    Off device if grid_buffer more than 2 kW. 
   * Grid Off
   *    Off device
   *    HERE WILL BE SOLAR CONTROL
   */
  controlPriorityGroupTwo = () => {
    const devices_group = this.sockets.getDevicesByPriorityGroup(2)
    Object.keys(devices_group).forEach(key => {
      const device = devices_group[key];
      if (
        this.isGrid() &&
        device.isDeviceOff()
      ) {
        if (
          this.pvPotential() > device.max_power * 0.33 &&
          this.gridLoad() < this.grid_buffer
        ) {
          this.runCmd(device.id, CMD_ACTIONS.DEVICE_ON)
        }
        return
      }

      if (
        this.isGrid() &&
        device.isDeviceOn()
      ) {
        if (this.gridLoad() > this.grid_buffer) {
          this.runCmd(device.id, CMD_ACTIONS.DEVICE_OFF)
        }
        return
      }
      
      if (
        !this.isGrid() &&
        device.isDeviceOn()
      ) {
        this.runCmd(device.id, CMD_ACTIONS.DEVICE_OFF)
        return
      }
    })
  }

  /**
   * PRIORIRY_GROUP THREE (Solar Only). Charge Stations
   * Grid On
   *    On device
   * Grid Off
   *    Off device
   *    HERE WILL BE SOLAR CONTROL
   */
  controlPriorityGroupThree = () => {
    const devices_group = this.sockets.getDevicesByPriorityGroup(3)

    for (const key of Object.keys(devices_group)) {
      const device = devices_group[key]
      if (
        this.gridLoad() <= 0 &&
        this.pvPotential() >= this.homeLoad() &&
        device.isDeviceOff()
      ) {
        this.runCmd(device.id, CMD_ACTIONS.DEVICE_ON)
        break;
      }

      if (
        (
          this.gridLoad() > 0 ||
          this.pvPotential() < this.homeLoad()
        ) &&
        device.isDeviceOn()
      ) {
        this.runCmd(device.id, CMD_ACTIONS.DEVICE_OFF)
        break;
      }
    }
  }

  /**
   * PRIORIRY_GROUP Four (Solar Only)
   * Grid On
   *    On device
   * Grid Off
   *    Off device
   *    HERE WILL BE SOLAR CONTROL
   */
  controlPriorityGroupFour = () => {
    const devices_group = this.sockets.getDevicesByPriorityGroup(4)
    for (const key of Object.keys(devices_group)) {
      const device = devices_group[key]
      if (this.isGrid() && !device.isDeviceOn()) {
        this.runCmd(device.id, CMD_ACTIONS.DEVICE_ON)
        break
      }
      
      if (!this.isGrid() && device.isDeviceOn()) {
        this.runCmd(device.id, CMD_ACTIONS.DEVICE_OFF)
        break
      }
    }
  }

  isGrid = () => this.inverter.params[PARAM_GRID_STATUS].value === ON_GRID

  pvPotential = () => this.inverter.params[PARAM_PV_POWER_POTENTIAL].value

  pvPower = () => this.inverter.params[PARAM_PV_POWER].value

  gridLoad = () => this.inverter.params[PARAM_GRID_POWER].value

  homeLoad = () => this.inverter.params[PARAM_LOAD_POWER].value

  smartControl = () => {
    setInterval(() => {

      // if (process.env.ACTIVE_STREAM === 'false') return;
      console.log('🎈🎈🎈🎈🎈🎈🎈 Iteration 🎈🎈🎈🎈🎈🎈🎈🎈🎈')
      console.log(this.cmd)

      this.processCmd()

      this.checkCmdExecution()

      this.checkCmdReset()
      
      if (this.isCmdInProgress()) return;

      const controls = [
        this.controlPriorityGroupOne,
        this.controlPriorityGroupTwo,
        this.controlPriorityGroupThree,
        this.controlPriorityGroupFour,
      ]

      for (const control of controls) {
        control()
        if (this.isCmdInProgress()) break;
      }
    }, 1000)
  }

  init = () => {
    this.syncDb()
    this.smartControl()
    this.mqtt = new MQTT(process.env.MQTT_HOST, process.env.MQTT_PORT, this.on_message)
    this.mqtt.init()
  }

  on_publish = (topic, message) => {
    this.mqtt.publish(topic, message)
  }

  on_message = (topic, message, packet) => {
    if (topic === this.inverter.topic) this.inverter.stream(message)
    else if (['/tele', '/stat'].some((key) => topic.includes(key))) this.sockets.stream(topic, message)
  }
}

export default PowerStream;

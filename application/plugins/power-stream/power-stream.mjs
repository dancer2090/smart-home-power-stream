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
  PARAM_BATTERY_STATUS,
  BATTERY_CHARGE,
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
  }

  initDevices = async () => {
    const query = await this.pg.query('SELECT * FROM devices');
    if (query) this.sockets.setDevices(query.rows)
  }

  getInvertor = async () => {
    const ip = process.env.LOGGER_IP
    const pv_potential = this.inverter.params[PARAM_PV_POWER_POTENTIAL].value
    const pv_power = this.inverter.params[PARAM_PV_POWER].value
    const grid_status = this.inverter.params[PARAM_GRID_STATUS].value === ON_GRID
    const grid_load = this.inverter.params[PARAM_GRID_POWER].value
    const load = this.inverter.params[PARAM_LOAD_POWER].value

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
      device_name: device_name,
      action: CMD_ACTIONS.DEVICE_ON,
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

  smartControl = () => {
    setInterval(() => {

      // if (process.env.ACTIVE_STREAM === 'false') return;
      console.log('🎈🎈🎈🎈🎈🎈🎈 Iteration 🎈🎈🎈🎈🎈🎈🎈🎈🎈')
      console.log(this.cmd, this.cmds.length)

      this.processCmd()

      this.checkCmdExecution()

      this.checkCmdReset()
      
      console.log(this.isCmdInProgress(), this.cmd)
      if (this.isCmdInProgress()) return;

      const potential = this.inverter.params[PARAM_PV_POWER_POTENTIAL].value
      const pv_power = this.inverter.params[PARAM_PV_POWER].value
      const is_grid = this.inverter.params[PARAM_GRID_STATUS].value === ON_GRID
      const is_used_battery = this.inverter.params[PARAM_BATTERY_STATUS].value !== BATTERY_CHARGE
      const load = this.inverter.params[PARAM_LOAD_POWER].value
      
      const devices_group1 = this.sockets.getDevicesByPriorityGroup(1)
      const devices_group2 = this.sockets.getDevicesByPriorityGroup(2)
      // console.table({ potential, is_grid, load, pv_power, is_used_battery })

      if (is_grid) {
        // Priority 0 - on every time
        // Priority 1 - включен всегда, если есть энергия (либо grid, либо солнце)
        // Насос

        // Priority 2 - включен в дневное время суток если есть энергия хотя бы 1 кВт от Солнца, сеть включена
        // Бойлер
        // Тут желательно понимать будет ли 1 кВт вообще в облачную погоду. Пока под вопросом.
              // on device
        //     // off device
        //     if (
        //       (potential - load) < devices_group2[key].max_power * 0.66 * -1 &&
        //       devices_group2[key].active_status === true &&
        //       devices_group2[key].active_power !== 0
        //     ) 
        //     {
        //       devices_group2[key].stopWithGrid(() => {
        //         this.mqtt.publish(`mqtt/${devices_group2[key].id}/cmnd/Power`, '0')
        //       })
        //     }
        //   })
      }

      if (!is_grid) {
        // wait when solar radiation sensor comes
        // fetch solar radiation parameter (WebHMI API, Forecast API)
        // Predict potential by using model
        // potential = new_value

        // Priority 0 - on every time
        // Priority 1 - включен всегда, если есть энергия (солнце)
        // Насос
        // Тут можно сделать скидку на мощность, если хорошие аккумы и ставить формулу. Пока в работе
        // (potential - load) > (devices_group1[key].max_power - 1000). 1 кВт  с аккумов берем.

        Object.keys(devices_group2).map(key => {
          console.log('cmd', devices_group2[key].id, CMD_ACTIONS.DEVICE_OFF)
          this.runCmd(devices_group2[key].id, CMD_ACTIONS.DEVICE_OFF)
        })
      }

        // Priority 3 - включен в дневное время суток если есть энергия солнца хотя бы 500 Вт
        // Зарядная станция (самокат)

        // Priority 4 - включен в дневное время суток если есть свободная энергия солнца хотя бы 2000 Вт
        // Стиралка, Духовка.

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
    // console.log(topic)
    if (topic === this.inverter.topic) this.inverter.stream(message)
    else if (['/tele', '/stat'].some((key) => topic.includes(key))) this.sockets.stream(topic, message)
  }
}

export default PowerStream;

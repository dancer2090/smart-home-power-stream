import MQTT from '../../lib/mqtt-sh.mjs';
import Inverter, {
  PARAM_PV_POWER_POTENTIAL,
  PARAM_GRID_STATUS, ON_GRID,
  PARAM_LOAD_POWER,
  PARAM_PV_POWER,
  PARAM_BATTERY_STATUS,
  BATTERY_CHARGE,
} from './devices/inverter.mjs';
import Tashmota from './devices/tashmota.mjs'

class PowerStream {
  constructor(pg) {
    this.pg = pg
    this.mqtt = null
    this.inverter = new Inverter()
    this.sockets = new Tashmota(this.on_publish)
  }

  initDevices = async () => {
    const query = await this.pg.query('SELECT * FROM devices');
    if (query) this.sockets.setDevices(query.rows)
  }

  syncDb = () => {
    setInterval(() => {
      Object.keys(this.sockets.devices).map(device => {
        const item = this.sockets.devices[device]
        const str = `
          INSERT INTO devices (device_type, device_name, max_power, active_status)
          VALUES ('socket', '${item.id}', ${item.max_power}, ${item.getValue() > 0 ? true : false})
          ON CONFLICT (device_name)
          DO UPDATE SET 
          device_type = 'socket',
          max_power = ${item.max_power},
          active_status = ${item.getValue() > 0 ? true : false} 
        `;
        this.pg.query(str)
      })
    }, 10000)    
  }

  smartControl = () => {
    setInterval(() => {
      const iteration_priority = {
        one: false,
        two: false,
        three: false,
        fourth: false,
        five: false
      }
      const potential = this.inverter.params[PARAM_PV_POWER_POTENTIAL].value
      const pv_power = this.inverter.params[PARAM_PV_POWER].value
      const is_grid = this.inverter.params[PARAM_GRID_STATUS].value === ON_GRID
      const is_used_battery = this.inverter.params[PARAM_BATTERY_STATUS].value !== BATTERY_CHARGE
      const load = this.inverter.params[PARAM_LOAD_POWER].value

      console.table({ potential, is_grid, load, pv_power, is_used_battery })
      
      // Priority 0 - on every time
      // Priority 1 - включен всегда, если есть энергия (либо grid, либо солнце)
      // Насос
      if (is_grid || potential > 2500) {
        // for devices with priority 1
        // this.mqtt.publish()
        // return
      }

      // Priority 2 - включен в дневное время суток если есть энергия хотя бы 1 кВт, сеть включена
      // Бойлер
      if (is_grid && (potential - load) > 1000) {
        // for devices with priority 2
        // this.mqtt.publish()
        // return
      }

      // Priority 3 - включен в дневное время суток если есть энергия солнца хотя бы 500 Вт
      // Зарядная станция (самокат)
      if ((potential - load) > 500) {
        return
      }

      // Priority 4 - включен в дневное время суток если есть свободная энергия солнца хотя бы 2000 Вт
      // Стиралка, Духовка.
      if (is_grid || potential > 2000) {
        
        return
      }

    }, 5000)
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

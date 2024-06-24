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
          INSERT INTO devices (device_type, device_name, max_power, active_status, device_ip)
          VALUES ('socket', '${item.id}', ${item.max_power}, ${item.getValue() > 0 ? true : false}, '${item.device_ip}')
          ON CONFLICT (device_name)
          DO UPDATE SET 
          device_type = 'socket',
          max_power = ${item.max_power},
          device_ip = '${item.device_ip}',
          active_status = ${item.getValue() > 0 ? true : false} 
        `;
        this.pg.query(str)
      })
    }, 10000)    
  }

  smartControl = () => {
    setInterval(() => {
      const potential = this.inverter.params[PARAM_PV_POWER_POTENTIAL].value
      const pv_power = this.inverter.params[PARAM_PV_POWER].value
      const is_grid = this.inverter.params[PARAM_GRID_STATUS].value === ON_GRID
      const is_used_battery = this.inverter.params[PARAM_BATTERY_STATUS].value !== BATTERY_CHARGE
      const load = this.inverter.params[PARAM_LOAD_POWER].value
      
      const devices_group1 = this.sockets.getDevicesByPriorityGroup(1)
      const devices_group2 = this.sockets.getDevicesByPriorityGroup(2)
      console.table({ potential, is_grid, load, pv_power, is_used_battery })

      if (is_grid) {
        // Priority 0 - on every time
        // Priority 1 - включен всегда, если есть энергия (либо grid, либо солнце)
        // Насос
        Object.keys(devices_group1).map(key => {
          devices_group1[key].start(() => {
            this.mqtt.publish(`mqtt/${devices_group1[key].id}/cmnd/Power`, '1')
          })
        })

        // Priority 2 - включен в дневное время суток если есть энергия хотя бы 1 кВт от Солнца, сеть включена
        // Бойлер
        // Тут желательно понимать будет ли 1 кВт вообще в облачную погоду. Пока под вопросом.
        if ((potential - load) > 1000) {
          Object.keys(devices_group2).map(key => {
            devices_group2[key].start(() => {
              this.mqtt.publish(`mqtt/${devices_group2[key].id}/cmnd/Power`, '1')
            })
          })
        } else {
          Object.keys(devices_group2).map(key => {
            devices_group2[key].stop(() => {
              this.mqtt.publish(`mqtt/${devices_group2[key].id}/cmnd/Power`, '0')
            })
          })
        }
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
        Object.keys(devices_group1).map(key => {
          if ((potential - load) > devices_group1[key].max_power && !is_used_battery) {
            devices_group1[key].start(() => {
              this.mqtt.publish(`mqtt/${devices_group1[key].id}/cmnd/Power`, '1')
            })
          } else {
            devices_group1[key].start(() => {
              this.mqtt.publish(`mqtt/${devices_group1[key].id}/cmnd/Power`, '-')
            })
          }
          
        })
      }

      // Priority 3 - включен в дневное время суток если есть энергия солнца хотя бы 500 Вт
      // Зарядная станция (самокат)
      // if ((potential - load) > 500) {
      //   return
      // }

      // Priority 4 - включен в дневное время суток если есть свободная энергия солнца хотя бы 2000 Вт
      // Стиралка, Духовка.
      // if (is_grid || potential > 2000) {
        
      //   return
      // }

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

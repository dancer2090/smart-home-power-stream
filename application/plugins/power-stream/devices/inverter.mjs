export const ON_GRID = 'On-Grid'
export const OFF_GRID = 'Off-Grid'
export const BATTERY_CHARGE = 'Charge'
export const BATTERY_DISCHARGE = 'Discharge'
export const BATTERY_STAND_BY = 'Stand-by'

export const PARAM_PV_POWER = 'pv_power'
export const PARAM_GRID_POWER = 'grid_power'
export const PARAM_GRID_STATUS = 'grid_status'
export const PARAM_PV_POWER_POTENTIAL = 'pv_power_potential'
export const PARAM_BATTERY_STATUS = 'battery_status'
export const PARAM_LOAD_POWER = 'load_power'

class Inverter {
  constructor() {
    this.id = 'deye_inverter_ivan'
    this.topic = `mqtt/${this.id}/tele/STATE`
    this.params = {
      [PARAM_PV_POWER]: {
        label: 'PV Power',
        value: 0,
        measure: 'VT',
        key1: 'PV1 Power',
        key2: 'PV2 Power',
        reset_value: 0,
      },
      [PARAM_GRID_POWER]: {
        label: 'Grid Power',
        value: 0,
        measure: 'VT',
        key: 'Total Grid Power',
        reset_value: 0,
      },
      [PARAM_GRID_STATUS]: {
        label: 'Grid Status',
        value: OFF_GRID,
        measure: '',
        key: 'Grid-connected Status',
        reset_value: OFF_GRID,
      },
      [PARAM_PV_POWER_POTENTIAL]: {
        label: 'PV Power Potential',
        value: 0,
        measure: 'VT',
        key: 'pv_power_potential',
        reset_value: 0,
      },
      [PARAM_PV_POWER_POTENTIAL]: {
        label: 'PV Power Potential',
        value: 0,
        measure: 'VT',
        key: 'pv_power_potential',
        reset_value: 0,
      },
      [PARAM_BATTERY_STATUS]: {
        label: 'Battery Status',
        value: BATTERY_STAND_BY,
        measure: '',
        key: 'Battery Status',
        reset_value: BATTERY_STAND_BY,
      },
      [PARAM_LOAD_POWER]: {
        label: 'Load Power',
        value: 0,
        measure: '',
        key: 'Total Load Power',
        reset_value: 0,
      }
    }

    this.last_message_timestamp = 0
    this.reset_timer = 30 * 1000

    this.autoreset()
  }

  setParameter = (name, value) => {
    this.params[name].value = value
  }

  getParameter = (name) => {
    return this.params[name]
  }

  getAllParameters = () => {
    return this.params;
  }

  stream = (message) => {
    try {
      
      const json = JSON.parse(message)
      const pv_power = this.getParameter(PARAM_PV_POWER)
      this.setParameter(
        PARAM_PV_POWER,
        json[pv_power.key1] + json[pv_power.key2]
      )
      this.setParameter(PARAM_GRID_POWER, json[this.getParameter(PARAM_GRID_POWER).key])
      this.setParameter(PARAM_GRID_STATUS, json[this.getParameter(PARAM_GRID_STATUS).key])
      this.setParameter(PARAM_BATTERY_STATUS, json[this.getParameter(PARAM_BATTERY_STATUS).key])
      this.setParameter(PARAM_LOAD_POWER, json[this.getParameter(PARAM_LOAD_POWER).key])

      this.culculate_pv_power_potential()

      this.last_message_timestamp = new Date().getTime()
    } catch (error) {
      console.log(error)
      console.log('Fail to Parse Inverter data')
    }
  }

  culculate_pv_power_potential = () => {
    try {
      if (this.getParameter(PARAM_GRID_STATUS).value == ON_GRID) {
        this.setParameter(PARAM_PV_POWER_POTENTIAL, this.getParameter(PARAM_PV_POWER).value)
      } else {
        this.setParameter(PARAM_PV_POWER_POTENTIAL, 0)
      }      
    } catch (error) {
      console.log(error)
      console.log('Fail to Culculate Power Potential')
    }
  }

  // result_log = (item) => {
  //   console.log(`${item.label}: ${item.value} ${item.measure}`)
  // }

  autoreset = () => {
    setInterval(() => {
      if ((new Date().getTime() - this.last_message_timestamp) > 30 * 1000) {
        Object.keys(this.params).map((key) => {
          this.setParameter(key, this.getParameter(key).reset_value)
        })
      }
    }, 30000)
  }

  // watch = () => {
  //   setInterval(() => {
  //     Object.keys(this.params).map((key) => {
  //       this.result_log(this.params[key])
  //     })
  //   }, 5000)
  // }
}

export default Inverter
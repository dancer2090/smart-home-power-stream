import { modbusTcpRequest } from "../../../lib/modbus/index.mjs"
import { cos, sin, convertDegToRadians } from '../../../lib/math.mjs';
import SunCalc from 'suncalc';
import dayjs, {  localDateTime } from '../../../lib/date.mjs';

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
export const PARAM_SOLAR_RADIATION = 'solar_radiation'

class Inverter {
  constructor() {
    this.id = 'deye_inverter_ivan'
    this.topic = `mqtt/${this.id}/tele/STATE`
    this.params = {
      [PARAM_PV_POWER]: {
        label: 'PV Power',
        value: 0,
        measure: 'W',
        key1: 'PV1 Power',
        key2: 'PV2 Power',
        reset_value: 0,
      },
      [PARAM_GRID_POWER]: {
        label: 'Grid Power',
        value: 0,
        measure: 'W',
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
        measure: 'W',
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
        measure: 'W',
        key: 'Total Load Power',
        reset_value: 0,
      },
      [PARAM_SOLAR_RADIATION]: {
        label: 'Solar Radiation',
        value: 0,
        measure: 'W/m2',
        key: 'solar_radiation',
        reset_value: 0,
      }
    }

    this.last_message_timestamp = 0

    this.RESET_TIMER = 120 * 1000
    this.AUTORESET_INTERVAL = 15 * 1000
    this.SOLAR_RADIATION_INTERVAL = 5 * 1000

    const Pmax = 4920; // W
    const Istc = 1000; // W/m2
    const degPannelToGround = 30 // deg
    const degPannelToNorth = 28 // deg
    const latitude = 50.4902 // coordinates
    const longitude = 30.3759 // coordinates
    const n = 0.95 // loses

    this.OPTIONS = { 
      Pmax,
      Istc,
      degPannelToGround,
      degPannelToNorth,
      n,
      latitude,
      longitude
    };

    this.autoreset()
    this.initGetSolarRadiation()
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

  initGetSolarRadiation = () => {
    try {
      setInterval(async ()=> {
        const radiation = await modbusTcpRequest({
          host: process.env.MODBUS_TCP_SERVER,
          port: process.env.MODBUS_TCP_PORT,
          unitId: process.env.MODBUS_SOLAR_SENSOR_ID,
        });
        this.setParameter(PARAM_SOLAR_RADIATION, radiation)
      }, this.SOLAR_RADIATION_INTERVAL)
    } catch (error) {
      console.log('fail to fetch solar radiation')
    }
  }

  stream = (message) => {
    try {
      const json = JSON.parse(message)
      
      const pv_power = this.getParameter(PARAM_PV_POWER)
      console.log('json')
      if (Number.isInteger(json[pv_power.key1]) && Number.isInteger(json[pv_power.key2])) {
        this.setParameter(
          PARAM_PV_POWER,
          (json[pv_power.key1] + json[pv_power.key2]) ?? 0
        )
      }
      
      if (Number.isInteger(json[this.getParameter(PARAM_GRID_POWER).key])) {
        this.setParameter(PARAM_GRID_POWER, json[this.getParameter(PARAM_GRID_POWER).key])
      }
      
      this.setParameter(PARAM_GRID_STATUS, json[this.getParameter(PARAM_GRID_STATUS).key])

      this.setParameter(PARAM_BATTERY_STATUS, json[this.getParameter(PARAM_BATTERY_STATUS).key])
      

      if (Number.isInteger(json[this.getParameter(PARAM_LOAD_POWER).key])) {
        this.setParameter(PARAM_LOAD_POWER, json[this.getParameter(PARAM_LOAD_POWER).key])
      }

      this.calculate_pv_power_potential()

      this.last_message_timestamp = new Date().getTime()

      console.table([
        this.getParameter(PARAM_PV_POWER),
        this.getParameter(PARAM_PV_POWER_POTENTIAL),
        this.getParameter(PARAM_SOLAR_RADIATION),
        this.getParameter(PARAM_GRID_POWER),
        this.getParameter(PARAM_GRID_STATUS),
        this.getParameter(PARAM_LOAD_POWER),
      ])
    } catch (error) {
      console.log(error)
      console.log('Fail to Parse Inverter data')
    }
  }

  radiationToPower = (solar_radiation) => {
    const { Pmax, degPannelToGround, degPannelToNorth, latitude, longitude, Istc, n } = this.OPTIONS;
    const time = localDateTime();
    const sunPosition = SunCalc.getPosition(
      new Date(time),
      latitude,
      longitude,
    )

    const cosQ = cos(degPannelToGround);
    const Sunx = cos(sunPosition.altitude, 'radians') * sin(sunPosition.azimuth, 'radians')
    const Suny = cos(sunPosition.altitude, 'radians') * cos(sunPosition.azimuth, 'radians')
    const Sunz = sin(sunPosition.altitude, 'radians')
    const Pannelx = sin(degPannelToGround) * sin(degPannelToNorth)
    const Pannely = sin(degPannelToGround) * cos(degPannelToNorth)
    const Pannelz = cos(degPannelToGround)

    const cosFi2 = Math.abs(Sunx * Pannelx) + Math.abs(Suny * Pannely) + Math.abs(Sunz * Pannelz);
    return Math.round(
      Pmax 
      * (solar_radiation * cosQ * (sunPosition.azimuth > 0 ? cosFi2 : 1) / Istc)
      * n
    );
  }

  calculate_pv_power_potential = () => {
    try {
      if (this.getParameter(PARAM_GRID_STATUS).value === ON_GRID) {
        this.setParameter(PARAM_PV_POWER_POTENTIAL, this.getParameter(PARAM_PV_POWER).value)
      } else if (this.getParameter(PARAM_GRID_STATUS).value === OFF_GRID) {
        const pv_caclucated = this.radiationToPower(this.getParameter(PARAM_SOLAR_RADIATION).value) ?? 0;
        this.setParameter(PARAM_PV_POWER_POTENTIAL, pv_caclucated)
      } else {
        this.setParameter(PARAM_PV_POWER_POTENTIAL, 0)
      }    
    } catch (error) {
      console.log(error)
      console.log('Fail to Culculate Power Potential')
    }
  }

  autoreset = () => {
    setInterval(() => {
      if ((new Date().getTime() - this.last_message_timestamp) < this.RESET_TIMER) return
      Object.keys(this.params).map((key) => {
        this.setParameter(key, this.getParameter(key).reset_value)
      })
    }, this.AUTORESET_INTERVAL)
  }
}

export default Inverter
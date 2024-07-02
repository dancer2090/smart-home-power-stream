import { currentTimestamp } from '../../../lib/helper.mjs'
class Device {
  constructor(id, max_power = 0, priority_group = 0, device_ip = '') {
    this.id = id
    this.energy = null
    this.energy_last_update_time = 0
    this.max_power = max_power
    this.priority_group = priority_group    
    this.startTime = null
    this.stopTime = null
    this.device_ip = device_ip
    this.device_name = id
    this.active_status = false
    this.active_power = 0

    this.offDelayInteval = 5 * 60 * 1000
    
    this.autoreset()
  }

  isDeviceOn = () => {
    return this.active_status
  }

  isDeviceOff = () => {
    return !this.isDeviceOn()
  }

  autoreset = () => {
    setInterval(() => {
      if ((currentTimestamp - this.energy_last_update_time) > 30 * 1000) {
        this.energy = null
        this.active_power = 0
        this.active_status = false
      }
    }, 30000)
  }

  controlMaxPower = () => {
    const power = this.getValue()?.Power ?? 0
    if (power > this.max_power) this.max_power = power
  }

  controlActivePower = () => {
    const power = this.getValue()?.Power ?? 0
    this.active_power = power
  }

  parser = (topic, message) => {
    const parseMessage = message.toString()
    const parseTopic = topic.split('/')
    const handler = parseTopic[2]
    const action = parseTopic[3]
    
    try {
      if (this.id === 'plug_test_smart_home') {
        // console.log(handler, action, parseMessage)        
      }
      if (handler === 'stat' && action === 'STATUS11') {
        const json = JSON.parse(parseMessage)
        this.active_status = json?.StatusSTS?.POWER === 'ON'
      }
      if (handler === 'stat' && action === 'POWER') {
        this.active_status = parseMessage === 'ON'
      }
      if (handler === 'stat' && action === 'RESULT') {
        const json = JSON.parse(parseMessage)
        this.active_status = json?.POWER === 'ON'
      }
      if (handler === 'stat' && action === 'STATUS5') {
        const json = JSON.parse(parseMessage)
        this.device_ip = json?.StatusNET?.IPAddress ?? ''
      }
      if (handler === 'stat' && action === 'STATUS10') {
        const json = JSON.parse(parseMessage)
        this.energy = json?.StatusSNS?.ENERGY
        this.energy_last_update_time = new Date(json.Time).getTime()
      }
      if (handler === 'tele' && action === 'SENSOR') {
        const json = JSON.parse(parseMessage)
        this.energy = json.ENERGY
        this.energy_last_update_time = new Date(json.Time).getTime()
      }
      this.energy_last_update_time = new Date().getTime()
    } catch (e) {

    }
    
    this.controlMaxPower()
    this.controlActivePower()
  }

  getValue = () => {
    return this.energy ?? null
  }

  start = (callback = () => {}) => {
    if (
      (currentTimestamp() - this.startTime) > 1 * 60 * 1000
    ) {
      callback()
      this.startTime = currentTimestamp()
    }
  }

  offDelay = () => {
    return (currentTimestamp() - this.startTime) > this.offDelayInteval
  }

  stopWithGrid = () => {
    // set 5 min delay if on
    if (
      (currentTimestamp() - this.stopTime) > 5 * 1000 &&
      this.offDelay
    )
    {
      callback()
      this.stopTime = currentTimestamp()
    }
  }

  stop = (callback = () => {}) => {
    if (
      (currentTimestamp() - this.stopTime) > 5 * 1000
    ) 
      {
      callback()
      this.stopTime = currentTimestamp()
    }
  }
}

export default Device;

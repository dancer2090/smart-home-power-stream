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
    this.active_status = false
    this.active_power = 0
    
    this.autoreset()
  }

  autoreset = () => {
    setInterval(() => {
      if ((this.currentTimestamp() - this.energy_last_update_time) > 30 * 1000) {
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

    // if (handler === 'tele' && action === 'STATE') {
    //   console.log(JSON.parse(parseMessage))
    // }
    if (handler === 'stat' && action === 'POWER') {
      this.active_status = parseMessage === 'ON'
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

    this.controlMaxPower()
    this.controlActivePower()
  }

  getValue = () => {
    return this.energy ?? null
  }

  currentTimestamp = () => new Date().getTime()

  start = (callback = () => {}) => {
    if (
      (this.currentTimestamp() - this.startTime) > 5 * 60 * 1000
      && this.active_power === 0
    ) {
      callback()
    }
    this.startTime = this.currentTimestamp()
  }

  stop = (callback = () => {}) => {
    this.stopTime = this.currentTimestamp()
    if ((this.currentTimestamp() - this.startTime) > 5 * 1000) { // 5 sec
      callback()
    }
  }
}

export default Device;

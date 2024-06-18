class Device {
  constructor(id, max_power = 0) {
    this.id = id
    this.energy = null
    this.energy_last_update_time = 0
    this.max_power = max_power
    this.autoreset()
  }

  autoreset = () => {
    setInterval(() => {
      if ((new Date().getTime() - this.energy_last_update_time) > 30 * 1000) {
        this.energy = null
      }
    }, 30000)
  }

  controlMaxPower = () => {
    const power = this.getValue()?.Power ?? 0
    if (power > this.max_power) this.max_power = power
  }

  parser = (topic, message) => {
    const parseMessage = message.toString()
    const parseTopic = topic.split('/')
    const handler = parseTopic[2]
    const action = parseTopic[3]

    // if (handler === 'tele' && action === 'STATE') 
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
  }

  getValue = () => {
    return this.energy ?? null
  }
}

export default Device;

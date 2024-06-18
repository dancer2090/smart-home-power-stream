
import Device from './device.mjs'

class Tashmota {
  constructor(on_publish = null) {
    this.devices = {}
    this.on_publish = on_publish
    this.ping()
  }

  setDevices = (devices = []) => {
    devices.map(device => {
      this.devices[device.device_name] = new Device(device.device_name, device.max_power)
    })
  }

  ping = () => {
    if (this.on_publish) {
      setInterval(() => {
        Object.keys(this.devices).map((key) => {
          this.on_publish(`mqtt/${key}/cmnd/STATUS`, '10')
        })
      }, 10000)
    }    
  }

  stream = (topic, message) => {
    const device = topic.split('/')[1] // mqqtt/devicename/tele/STATE
    if (!this.devices[device]) {
      this.devices[device] = new Device(device, 0)
    }
    this.devices[device].parser(topic, message)
  }

  result_log = (key) => {
    console.log(`${key}: ${JSON.stringify(this.devices[key].getValue())}`)
  }

  watch = () => {
    setInterval(() => {
      console.log('Total Sockets Power', this.getTotalPower())
    }, 5000)
  }

  getTotalPower = () => {
    return Object.keys(this.devices).reduce((arr, key) => {
      const energy = this.devices[key].getValue()
      const total = arr + (energy?.Power ?? 0)
      return total
    }, 0)
  }
}

export default Tashmota;

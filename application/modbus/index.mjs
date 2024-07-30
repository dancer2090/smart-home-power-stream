import modbus from 'jsmodbus'
import net from 'net'
import util from 'util'

const socket = new net.Socket()
const options = {
  'host' : '192.168.1.130',
  'port' : '1111',
}
const client = new modbus.client.TCP(socket, 111)

socket.on('connect', function () {
  console.log('connected')
  client.readHoldingRegisters('0x000x00', '0x000x01')
    .then(function (resp) {
      console.log(resp.response._body.valuesAsArray)
      socket.end()
    }).catch(function () {
      console.error(util.inspect(arguments, {
        depth: null
      }))
      socket.end()
    })
})

socket.on('error', console.error)
socket.connect(options)

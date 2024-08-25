import modbus from 'jsmodbus'
import net from 'net'
import util from 'util'

export const modbusTcpRequest = async ({ host, port, unitId }) => new Promise((resolve, reject) => {
  const socket = new net.Socket()

  const options = {
    host,
    port,
  }

  const client = new modbus.client.TCP(socket, Number(unitId), 3000)

  socket.on('connect', function () {
    client.readHoldingRegisters(0, 1)
      .then(function (resp) {
        resolve(resp.response._body.valuesAsArray[0])
        socket.end()
      }).catch(function () {
        console.error(util.inspect(arguments, {
          depth: null
        }))
        reject(new Error('Fail to fetch modbus requiest'))
        socket.end()
      })
  })
  
  socket.on('error', console.error)
  socket.connect(options)
})

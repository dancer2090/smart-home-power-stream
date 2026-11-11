import modbus from 'jsmodbus'
import net from 'net'

export const modbusTcpRequest = ({ host, port, unitId, timeout = 3000 }) => new Promise((resolve, reject) => {
  if (!host || !port) {
    reject(new Error(`Modbus TCP host/port is not configured (host=${host}, port=${port})`))
    return
  }

  const socket = new net.Socket()
  const client = new modbus.client.TCP(socket, Number(unitId), timeout)

  const fail = (error) => {
    socket.destroy()
    reject(error)
  }

  socket.setTimeout(timeout, () => fail(new Error('Modbus TCP connection timeout')))

  socket.on('connect', () => {
    client.readHoldingRegisters(0, 1)
      .then((resp) => {
        resolve(resp.response._body.valuesAsArray[0])
        socket.end()
      })
      .catch((error) => fail(new Error(`Fail to fetch modbus request: ${error?.message ?? error}`)))
  })

  socket.on('error', fail)

  try {
    socket.connect({ host, port: Number(port) })
  } catch (error) {
    fail(error)
  }
})

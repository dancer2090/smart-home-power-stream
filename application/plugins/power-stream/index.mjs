import PowerStream from './power-stream.mjs'

export const PowerStreamApp = (pg) => {
  const stream = new PowerStream(pg)
  stream.initDevices()
  stream.init()
  return stream;
}

const PowerStreamPlugin = async (fastify, opts, done) => {
  fastify.decorate(
    'PowerStream',
    new PowerStream(fastify.pg)
  )
  await fastify.PowerStream.initDevices(fastify.pg)
  fastify.PowerStream.init()
  done()
}

export default PowerStreamPlugin;
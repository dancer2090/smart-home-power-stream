import PowerStream from './power-stream.mjs'

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
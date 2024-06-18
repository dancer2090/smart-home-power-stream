// Import the framework and instantiate it
import Fastify from 'fastify'
import fastifyPostgres from '@fastify/postgres'
import PowerStreamPlugin from './plugins/power-stream/index.mjs'
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER } from './constants.mjs'

const fastify = Fastify({
  logger: true
})

fastify.register(fastifyPostgres, {
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: DB_PORT
})

fastify.register(PowerStreamPlugin)

fastify.get('/', async function handler (request, reply) {
  return this.pg.query("SELECT * FROM devices");
})

fastify.register(PowerStreamPlugin)

try {
  await fastify.listen({ port: 3000 })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
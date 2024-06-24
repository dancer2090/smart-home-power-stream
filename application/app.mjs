// Import the framework and instantiate it
import Fastify from 'fastify'
import fastifyPostgres from '@fastify/postgres'
import fastifyEnv from '@fastify/env'
import fastifyWebsocket from '@fastify/websocket';
import { makeHandler } from 'graphql-ws/lib/use/@fastify/websocket';
import mercurius from 'mercurius'
import fastifyRoutes from './routes/index.mjs'
import PowerStreamPlugin from './plugins/power-stream/index.mjs'
import Migrate from './migrate.mjs'
import { schema } from './constants.mjs'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const getDevices = () => {
  return [
    {
      id: 'string',
      device_name: 'string',
      device_type: 'string',
      device_ip: 'string',
      max_power: 'interger',
      active_status: 'boolean',
      priority_group: 'boolean',
      device_ip: 'string',
    }
  ]
}

const schemaMerc = `
  type Device {
    id: ID
    device_name: String
    device_type: String
    device_ip: String
    max_power: Int
    active_status: Boolean
    priority_group: Boolean
  }

  type Query {
    devices: [Device]!
  }

`

const resolvers = {
  Query: {
    devices: async () => {
      return getDevices()
    }
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const is_production = process.env.NODE_ENV === 'production'

export default async function appFramework() {
  const fastify = Fastify({
    logger: true
  })
  await fastify.register(
    fastifyEnv,
    { 
      schema,
      dotenv: is_production ? { 
        path: `${__dirname}/../.env.production`
      } : true
    }
  )

  await fastify.register(fastifyPostgres, {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  })

  await Migrate()

  fastify.register(PowerStreamPlugin)

  fastify.register(fastifyWebsocket, {
    options: {
      maxPayload: 1048576
    }
  })

  fastify.register(mercurius, {
    schema: schemaMerc,
    resolvers,
    graphiql: true,
    subscription: true,
  })

  fastify.get('/subscription', { websocket: true }, (connection, req) => {
    connection.socket.on('message', message => {
      connection.socket.send('hi from server')
    })
  })

  fastify.register(fastifyRoutes)

  await fastify.ready()

  return fastify;
}

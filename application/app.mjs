// Import the framework and instantiate it
import Fastify from 'fastify'
import fastifyPostgres from '@fastify/postgres'
import fastifyStatic from '@fastify/static'
import fastifyEnv from '@fastify/env'
import cors from '@fastify/cors'
import mercurius from 'mercurius'
import fastifyRoutes from './routes/index.mjs'
import { PowerStreamApp } from './plugins/power-stream/index.mjs'
import Migrate from './migrate.mjs'
import { schema } from './constants.mjs'
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const schemaMerc = `
  type Device {
    id: ID
    device_name: String
    device_type: String
    device_ip: String
    max_power: Int
    active_status: Boolean
    priority_group: Int
    active_power: Int
  }

  type Invertor {
    id: ID
    ip: String
    pv_power: Int
    pv_potential: Int
    load: Int
    grid_load: Int
    grid_status: Boolean
  }

  type Query {
    devices: [Device]!
    invertor: Invertor!
  }

`

const resolvers = {
  Query: {
    devices: async () => {}
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const is_production = process.env.NODE_ENV === 'production'

export default async function appFramework() {
  const fastify = Fastify({
    logger: true
  })
  
  await fastify.register(cors)

  await fastify.register(
    fastifyEnv,
    { 
      schema,
      dotenv: is_production ? { 
        path: `${__dirname}/../.env.production`
      } : true
    }
  )

  fastify.register(fastifyStatic, {
    root: path.join(__dirname, 'public'),
    prefix: '/public/', // optional: default '/'
  })
  

  await fastify.register(fastifyPostgres, {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  })

  await Migrate()


  // await fastify.register(PowerStreamPlugin)


  // console.log(fastify)
  const stream = PowerStreamApp(fastify.pg)

  resolvers.Query.devices = async () => {
    const devices = await stream.getDevices()
    return devices;
  }
  resolvers.Query.invertor = async () => {
    const invertor = await stream.getInvertor()
    return invertor;
  }

  fastify.register(mercurius, {
    schema: schemaMerc,
    resolvers,
    graphiql: true,
    subscription: true,
  })

  fastify.register(fastifyRoutes)

  await fastify.ready()

  return fastify;
}

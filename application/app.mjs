// Import the framework and instantiate it
import Fastify from 'fastify'
import fastifyPostgres from '@fastify/postgres'
import fastifyStatic from '@fastify/static'
import fastifyEnv from '@fastify/env'
import cors from '@fastify/cors'
import mercurius from 'mercurius'
import { PowerStreamApp } from './plugins/power-stream/index.mjs'
import Migrate from './migrate.mjs'
import { schema } from './constants.mjs'
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import { getHistoryQuery } from './services/history.mjs'

const schemaMerc = `
  scalar DateTime
    @specifiedBy(url: "https://scalars.graphql.org/andimarek/date-time")

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
    solar_radiation: Int
  }

  type History {
    id: ID
    pv_power: Int
    load: Int
    grid_load: Int
    grid_status: Boolean
    solar_radiation: Int
    created_at: DateTime
  }

  type Query {
    devices: [Device]!
    invertor: Invertor!
    history: [History]!
  }

  type Mutation {
    device_edit(id: String, priority_group: Int): Device
  }

`

const resolvers = {
  Query: {},
  Mutation: {}
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
    prefix: '/', // optional: default '/'
  })
  

  await fastify.register(fastifyPostgres, {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  })

  await Migrate()

  const stream = PowerStreamApp(fastify.pg)

  resolvers.Query.devices = async () => {
    const devices = await stream.getDevices()
    return devices;
  }
  resolvers.Query.invertor = async () => {
    const invertor = await stream.getInvertor()
    return invertor;
  }

  resolvers.Mutation.device_edit = async (_, obj) => {
    const { id, priority_group } = obj;
    const invertor = await stream.editDevice(id, { priority_group })
    return invertor;
  }

  resolvers.Query.history = async() => {
    const sql = getHistoryQuery();
    console.log(sql)
    const history = await fastify.pg.query(sql)
    return history.rows ?? [];
  }

  fastify.register(mercurius, {
    schema: schemaMerc,
    resolvers,
    graphiql: true,
    subscription: true,
  })

  await fastify.ready()

  return fastify;
}

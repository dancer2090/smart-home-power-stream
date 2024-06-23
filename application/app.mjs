// Import the framework and instantiate it
import Fastify from 'fastify'
import fastifyPostgres from '@fastify/postgres'
import fastifyEnv from '@fastify/env'
import fastifyRoutes from './routes/index.mjs'
import PowerStreamPlugin from './plugins/power-stream/index.mjs'
import Migrate from './migrate.mjs'
import { schema } from './constants.mjs'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

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

  fastify.register(fastifyRoutes)

  await fastify.ready()

  return fastify;
}

import pg from 'pg';
import Postgrator from 'postgrator';
import path from 'node:path';
import parseArgs from 'minimist';

import { DB_HOST, DB_PORT, DB_PASSWORD, DB_USER, DB_NAME } from './constants.mjs'

const argv = parseArgs(process.argv.slice(2));

async function migrate() {
  const client = new pg.Client({
    host: DB_HOST,
    port: DB_PORT,
    database: DB_NAME, 
    user: DB_USER,
    password: DB_PASSWORD,
  });

  try {
    await client.connect();

    const postgrator = new Postgrator({
      migrationPattern: path.join(process.cwd(), '/migrations/*'),
      driver: 'pg',
      database: DB_NAME,
      schemaTable: 'migrations',
      currentSchema: 'public', // Postgres and MS SQL Server only
      execQuery: (query) => client.query(query),
    });

    let result;
    if (argv?.version) {
      console.log(argv?.version)
      result = await postgrator.migrate(argv?.version.toString())
    } else {
      result = await postgrator.migrate()
    }    

    if (result.length === 0) {
      console.log(
        'No migrations run for schema "public". Already at the latest one.'
      )
    }

    console.log('Migration done.')

    process.exitCode = 0
  } catch(err) {
    console.error(err)
    process.exitCode = 1
  }
  
  await client.end()
}

migrate()
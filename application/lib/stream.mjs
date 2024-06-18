import QueryStream from 'pg-query-stream'
import JSONStream from 'JSONStream'

async function queryStream (request, reply) {
  const client = await this.pg.connect()

  const slowQuery = `
    WITH start_time AS (SELECT pg_sleep(1) AS start_time)
    SELECT *
    FROM devices
    CROSS JOIN start_time;
  `;

  const query = new QueryStream(slowQuery, null, {
    highWaterMark: 500,
    batchSize: 100
  })

  const stream = client.query(query)
  stream.on('end', () => { client.release() })
  return stream.pipe(JSONStream.stringify())
}

const stream = async (fastify, opts) => {
  fastify.get('/api/stream', queryStream)
}

export default stream;

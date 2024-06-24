import fastifyPlugin from "fastify-plugin";

async function indexRoutes(fastify, options) {
  
  fastify.get('/', async function (req, reply) {

    const query = '{ add(x: 2, y: 2) }'
    return reply.graphql(query)
  })
}

export default fastifyPlugin(indexRoutes);
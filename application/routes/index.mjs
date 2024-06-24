import fastifyPlugin from "fastify-plugin";

async function indexRoutes(fastify, options) {
  
  fastify.get('/', async function (req, reply) {

    return 1
  })
}

export default fastifyPlugin(indexRoutes);
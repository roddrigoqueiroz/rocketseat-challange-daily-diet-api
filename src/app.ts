import fastify from 'fastify'
import { meal } from './routes/meal'
import { env } from './env/handle-env-variables'

const app = fastify({})

app.register(meal, { prefix: '/meal' })

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP Server Running!')
  })

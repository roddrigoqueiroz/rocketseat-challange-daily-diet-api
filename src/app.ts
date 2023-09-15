import fastify from 'fastify'
import { meal } from './routes/meal'
import { env } from './env/handle-env-variables'
import cookie from '@fastify/cookie'

const app = fastify({})

app.register(cookie)

app.register(meal, { prefix: '/meal' })

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP Server Running!')
  })

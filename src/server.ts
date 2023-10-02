import { app } from './app'
import { env } from './env/handle-env-variables'

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('HTTP Server Running!')
  })

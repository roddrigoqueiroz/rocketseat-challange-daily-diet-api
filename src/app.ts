import fastify from 'fastify'
import { meal } from './routes/meal'
import cookie from '@fastify/cookie'

export const app = fastify({})

app.register(cookie)

app.register(meal, { prefix: '/meal' })

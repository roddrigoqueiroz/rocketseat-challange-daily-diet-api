import { FastifyInstance } from 'fastify'
import { UUID, randomUUID } from 'crypto'
import { knex } from '../database'
import { z } from 'zod'
import { checkSessionId } from '../middlewares/check-if-session-id-exists'
import { checkUrlId } from '../middlewares/check-url-id'
import { Params } from '../@types/types'

export async function meal(app: FastifyInstance) {
  // List all meals
  app.get('/', { preHandler: [checkSessionId] }, async (request) => {
    const cookie = request.cookies.session_id

    const meals = await knex('meal').where('session_id', cookie)

    return meals
  })

  // List only one meal by ID
  app.get(
    '/:id',
    { preHandler: [checkSessionId, checkUrlId] },
    async (request, reply) => {
      const { id } = request.params as Params

      const cookie = request.cookies.session_id

      const meal = await knex('meal')
        .where('id', id)
        .andWhere('session_id', cookie)
        .first()

      return reply.code(200).send(meal)
    },
  )

  // Create a new meal
  app.post('/', async (request, reply) => {
    const checkBodyType = z.object({
      name: z.string(),
      description: z.string().nullable(),
      date: z.string(),
      inDiet: z.boolean(),
    })

    const parse = checkBodyType.safeParse(request.body)

    if (!parse.success) return reply.code(400).send('Wrong body arguments')

    const mealData = parse.data

    let sessionId = request.cookies.session_id

    if (!sessionId) {
      sessionId = randomUUID()

      reply.setCookie('session_id', sessionId, {
        maxAge: 1000 * 60 * 60 * 24 * 7,
      })
    }

    await knex('meal').insert({
      id: randomUUID(),
      name: mealData.name,
      description: mealData.description as string | undefined,
      date: new Date(mealData.date),
      inDiet: mealData.inDiet,
      session_id: sessionId as UUID | undefined,
    })

    return reply.code(201).send()
  })

  // Deletes a meal by ID
  app.delete(
    '/:id',
    { preHandler: [checkSessionId, checkUrlId] },
    async (request, reply) => {
      const { id } = request.params as Params

      const cookie = request.cookies.session_id

      await knex('meal').where('id', id).andWhere('session_id', cookie).delete()

      return reply.code(204).send()
    },
  )

  // TODO
  app.put(
    '/:id',
    { preHandler: [checkSessionId, checkUrlId] },
    async (request, reply) => {
      const { id } = request.params as Params

      const cookie = request.cookies.session_id
    },
  )
}

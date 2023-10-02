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

  // Counts the total number of meals a given user has created
  app.get(
    '/total',
    { preHandler: [checkSessionId] },
    async (request, reply) => {
      const cookie = request.cookies.session_id

      const totalMeals = await knex('meal')
        .where('session_id', cookie)
        .count('id', { as: 'total meals' })
        .first()

      return reply.code(200).send(totalMeals)
    },
  )

  // Counts the amount of meals in and out of the diet
  app.get(
    '/total-in-diet',
    { preHandler: [checkSessionId] },
    async (request, reply) => {
      const cookie = request.cookies.session_id

      const checkQuery = z.object({
        inDiet: z.string(),
      })

      const _query = checkQuery.parse(request.query)
      const query = { inDiet: _query.inDiet === 'true' }

      const totalMeals = await knex('meal')
        .where('session_id', cookie)
        .andWhere('inDiet', query.inDiet)
        .count('id', { as: 'total' })

      return reply.code(200).send(totalMeals)
    },
  )

  // Gives the best meal sequence, considering the date column
  app.get(
    '/best-meal-sequence',
    { preHandler: [checkSessionId] },
    async (request, reply) => {
      const cookie = request.cookies.session_id

      const bestMealSequence = await knex('meal')
        .where('session_id', cookie)
        .andWhere('inDiet', true)
        .orderBy('date', 'desc')

      return reply.code(200).send(bestMealSequence)
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

  // Updates a meal by ID
  app.put(
    '/:id',
    { preHandler: [checkSessionId, checkUrlId] },
    async (request, reply) => {
      const { id } = request.params as Params

      const cookie = request.cookies.session_id

      const newDataToParse = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        date: z.string().optional(),
        inDiet: z.boolean().optional(),
      })

      const _newData = newDataToParse.parse(request.body)

      const newData = {
        name: _newData.name,
        description: _newData.description,
        date: _newData.date ? new Date(_newData.date) : undefined,
        inDiet: _newData.inDiet,
      }

      await knex('meal')
        .where('id', id)
        .andWhere('session_id', cookie)
        .update(newData)

      return reply.code(200).send()
    },
  )
}

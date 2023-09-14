import { FastifyInstance } from 'fastify'
import { randomUUID } from 'crypto'
import { knex } from '../database'
import { z } from 'zod'

export async function meal(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    const meals = await knex('meal').select('*')

    return reply.code(200).send(meals)
  })

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

    await knex('meal').insert({
      id: randomUUID(),
      name: mealData.name,
      description: mealData.description as string | undefined,
      date: new Date(mealData.date),
      inDiet: mealData.inDiet,
    })

    return reply.code(201).send()
  })
}

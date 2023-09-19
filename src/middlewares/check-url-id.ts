import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'

export async function checkUrlId(request: FastifyRequest, reply: FastifyReply) {
  const expectedId = z.object({
    id: z.string().uuid(),
  })

  const parse = expectedId.safeParse(request.params)

  if (!parse.success)
    return reply.code(401).send('ERROR: Unauthorized. Wrong ID')

  const checkId = await knex('meal')
    .where('id', parse.data.id)
    .andWhere('session_id', request.cookies.session_id)

  if (checkId.length === 0)
    return reply
      .code(401)
      .send('ERROR: Unauthorized. This ID does not belongs to you')
}

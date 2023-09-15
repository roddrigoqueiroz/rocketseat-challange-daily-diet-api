import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function checkUrlId(request: FastifyRequest, reply: FastifyReply) {
  const expectedId = z.object({
    id: z.string().uuid(),
  })

  const parse = expectedId.safeParse(request.params)

  if (!parse.success)
    return reply.code(401).send('ERROR: Unauthorized. Wrong ID')

  return parse.data.id
}

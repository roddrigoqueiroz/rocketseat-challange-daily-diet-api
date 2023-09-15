import { FastifyReply, FastifyRequest } from 'fastify'

export async function checkSessionId(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (!request.cookies.session_id)
    return reply.code(401).send('ERROR: Unauthorized')
}

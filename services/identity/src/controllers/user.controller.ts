import type { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../db/client';

export async function getUserCountController(request: FastifyRequest, reply: FastifyReply) {
  try {
    const count = await prisma.user.count();
    return reply.send({ count });
  } catch (error: Error | unknown) {
    console.error('Failed to count users:', error);
    return reply.status(500).send({
      error: 'Internal server error',
      message: 'Failed to retrieve user count',
    });
  }
}

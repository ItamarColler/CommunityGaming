import type { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../db/client';

export async function healthCheckController(request: FastifyRequest, reply: FastifyReply) {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    return reply.send({
      status: 'ok',
      service: 'identity',
      database: 'connected',
    });
  } catch (error: unknown) {
    console.error('Database health check failed:', error);
    return reply.status(503).send({
      status: 'degraded',
      service: 'identity',
      database: 'disconnected',
    });
  }
}

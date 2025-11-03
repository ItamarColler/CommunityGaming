import type { FastifyInstance } from 'fastify';
import { healthCheckController } from '../controllers/health.controller';
import { getUserCountController } from '../controllers/user.controller';

export async function registerRoutes(fastify: FastifyInstance) {
  // Health check routes
  fastify.get('/health', healthCheckController);

  // User routes
  fastify.get('/users/count', getUserCountController);
}

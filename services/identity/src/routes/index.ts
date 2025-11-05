import { type FastifyInstance } from 'fastify';
import { healthCheckController } from '../controllers/health.controller';
import user from './user/user.router';

/**
 * Main router plugin
 */
async function router(fastify: FastifyInstance) {
  // Health check routes
  fastify.get('/health', healthCheckController);

  // Register user router
  await fastify.register(user);
}

export default router;


import { type FastifyInstance } from 'fastify';
import { getUserByIdController, getUserCountController, registerController } from '../../controllers/user.controller';

/**
 * User router plugin
 */
async function user(fastify: FastifyInstance) {
  // User routes
  fastify.get('/users/count', getUserCountController);
  fastify.post('/user', getUserByIdController);

  // Auth routes
  fastify.post('/auth/register', registerController);
}

export default user;

import Fastify from 'fastify';
import { createLogger } from '@community-gaming/utils';

const logger = createLogger('matchmaking-service');
const fastify = Fastify({ logger: true });

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', service: 'matchmaking' };
});

// Start server
const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 4005;
    await fastify.listen({ port, host: '0.0.0.0' });
    logger.info(`Matchmaking service running on port ${port}`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

start();

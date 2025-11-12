import Fastify from 'fastify';
import { createLogger } from '@community-gaming/utils';

const logger = createLogger('community-service');
const fastify = Fastify({ logger: true });

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', service: 'community' };
});

// Start server
const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 4004;
    await fastify.listen({ port, host: '0.0.0.0' });
    logger.info(`Community service running on port ${port}`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

start();

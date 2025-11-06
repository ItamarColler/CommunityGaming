import { fastify } from 'fastify';
import { createLogger } from '@community-gaming/utils';

const logger = createLogger('analytics-service');
const app = fastify({ logger: true });

// Health check
app.get('/health', async () => {
  return { status: 'ok', service: 'analytics' };
});

// Start server
const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 4007;
    await app.listen({ port, host: '0.0.0.0' });
    logger.info(`Analytics service running on port ${port}`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

start();

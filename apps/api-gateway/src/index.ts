import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { createLogger } from '@community-gaming/utils';
import { registerProxies } from './proxies';

const logger = createLogger('api-gateway');

const fastify = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  },
});

// Plugin registration will run inside start() to avoid top-level await issues

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', service: 'api-gateway' };
});

// Start server
const start = async () => {
  try {
    // Register plugins (do this at runtime so ts-node-dev can run in CommonJS mode)
    await fastify.register(cors, {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    });

    await fastify.register(helmet);

    await fastify.register(rateLimit, {
      max: 100,
      timeWindow: '1 minute',
    });

    // Register all service proxies
    await registerProxies(fastify);

    const port = process.env.PORT ? parseInt(process.env.PORT) : 4001;
    await fastify.listen({ port, host: '0.0.0.0' });
    logger.info(`API Gateway running on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import proxy from '@fastify/http-proxy';
import { createLogger } from '@community-gaming/utils';

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

// Identity Service URL (used when registering proxy inside start())
const identityServiceUrl = process.env.IDENTITY_SERVICE_URL || 'http://localhost:4001';

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

    // Register proxy to identity service
    await fastify.register(proxy, {
      upstream: identityServiceUrl,
      prefix: '/auth',
      rewritePrefix: '/auth',
      http2: false,
    });

    logger.info('Registered proxy routes:', {
      '/auth/*': identityServiceUrl,
    });

    const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
    await fastify.listen({ port, host: '0.0.0.0' });
    logger.info(`API Gateway running on port ${port}`);
    logger.info(`Proxying /auth/* to ${identityServiceUrl}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

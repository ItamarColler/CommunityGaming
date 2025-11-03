import Fastify from 'fastify';
import { createLogger } from '@community-gaming/utils';
import { prisma, disconnectDb } from './db/client';
import { env } from './config/env';
import { registerRoutes } from './routes';

const logger = createLogger('identity-service');
const fastify = Fastify({ logger: true });

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}, closing server gracefully...`);
  try {
    await fastify.close();
    await disconnectDb();
    logger.info('Server closed successfully');
    process.exit(0);
  } catch (err) {
    logger.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Start server
const start = async () => {
  try {
    // Test database connection on startup
    await prisma.$connect();
    logger.info('Database connected successfully');

    // Register all routes
    await registerRoutes(fastify);

    await fastify.listen({ port: env.PORT, host: '0.0.0.0' });
    logger.info(`Identity service running on port ${env.PORT}`);
  } catch (err) {
    logger.error('Failed to start server:', err);
    await disconnectDb();
    process.exit(1);
  }
};

start();

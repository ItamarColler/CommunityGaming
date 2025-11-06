import Fastify from 'fastify';
import { bootstrap } from 'fastify-decorators';
import { createLogger } from '@community-gaming/utils';
import { prisma, disconnectDb } from './db/prisma.client';
import { env } from './config/env';
import { resolve } from 'path';

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

    // Bootstrap controllers using fastify-decorators
    fastify.register(bootstrap, {
      directory: resolve(__dirname, 'controllers'),
      mask: /\.controller\./,
    });

    await fastify.listen({ port: env.PORT, host: '0.0.0.0' });
    logger.info(`Identity service running on port ${env.PORT}`);
  } catch (err) {
    logger.error('Failed to start server:', err);
    console.error('Full error:', err);
    await disconnectDb();
    process.exit(1);
  }
};

start();

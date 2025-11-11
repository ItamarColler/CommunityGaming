import type { FastifyInstance } from 'fastify';
import proxy from '@fastify/http-proxy';
import { createLogger } from '@community-gaming/utils';

const logger = createLogger('identity-proxy');

const identityServiceUrl = process.env.IDENTITY_SERVICE_URL || 'http://localhost:4002';

/**
 * Register identity service proxies
 * Proxies /auth and /onboarding routes to identity service
 */
export async function registerIdentityProxy(fastify: FastifyInstance): Promise<void> {
  // Register proxy for /auth routes
  await fastify.register(proxy, {
    upstream: identityServiceUrl,
    prefix: '/auth',
    rewritePrefix: '/auth',
    http2: false,
  });

  // Register proxy for /onboarding routes
  await fastify.register(proxy, {
    upstream: identityServiceUrl,
    prefix: '/onboarding',
    rewritePrefix: '/onboarding',
    http2: false,
  });

  logger.info('Identity service proxies registered', {
    '/auth/*': identityServiceUrl,
    '/onboarding/*': identityServiceUrl,
  });
}

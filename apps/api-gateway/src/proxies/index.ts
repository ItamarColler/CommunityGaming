import type { FastifyInstance } from 'fastify';
import { registerIdentityProxy } from './identity.proxy';
import { createLogger } from '@community-gaming/utils';

const logger = createLogger('proxies');

/**
 * Register all service proxies
 * This is the central place to register all microservice proxies
 */
export async function registerProxies(fastify: FastifyInstance): Promise<void> {
  logger.info('Registering service proxies...');

  // Register identity service proxy (/auth, /onboarding)
  await registerIdentityProxy(fastify);

  // Future proxies can be added here:
  // await registerCommunityProxy(fastify);
  // await registerMatchmakingProxy(fastify);
  // await registerPaymentsProxy(fastify);
  // await registerContentProxy(fastify);
  // await registerModerationProxy(fastify);
  // await registerAnalyticsProxy(fastify);

  logger.info('All service proxies registered successfully');
}

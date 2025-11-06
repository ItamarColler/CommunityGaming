import type { FastifyRequest } from 'fastify';

/**
 * Auth object that will be attached to every authenticated request
 */
export interface AuthContext {
  id: string;
  type: string;
}

/**
 * Extended Fastify request with auth context
 * Use this type for all authenticated endpoints
 */
export interface AuthenticatedRequest<T = Record<string, unknown>> extends FastifyRequest {
  body: T & {
    auth: AuthContext;
  };
}

/**
 * Type helper to extract the body type without auth
 */
export type RequestBody<T> = T & {
  auth: AuthContext;
};

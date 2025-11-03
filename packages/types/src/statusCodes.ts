/**
 * HTTP Status Codes with descriptions
 * Used across all API services for consistent response handling
 */

export enum StatusCode {
  // 2xx Success
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,

  // 3xx Redirection
  MOVED_PERMANENTLY = 301,
  FOUND = 302,
  NOT_MODIFIED = 304,

  // 4xx Client Errors
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  PAYMENT_REQUIRED = 402,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  NOT_ACCEPTABLE = 406,
  REQUEST_TIMEOUT = 408,
  CONFLICT = 409,
  GONE = 410,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,

  // 5xx Server Errors
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
}

/**
 * Human-readable descriptions for each status code
 */
export const StatusCodeDescription: Record<StatusCode, string> = {
  // 2xx Success
  [StatusCode.OK]: 'The request succeeded',
  [StatusCode.CREATED]: 'The request succeeded and a new resource was created',
  [StatusCode.ACCEPTED]: 'The request has been received but not yet acted upon',
  [StatusCode.NO_CONTENT]: 'The request succeeded but there is no content to return',

  // 3xx Redirection
  [StatusCode.MOVED_PERMANENTLY]: 'The resource has been moved permanently to a new URL',
  [StatusCode.FOUND]: 'The resource has been found at a different URL temporarily',
  [StatusCode.NOT_MODIFIED]: 'The resource has not been modified since last request',

  // 4xx Client Errors
  [StatusCode.BAD_REQUEST]: 'The request is malformed or contains invalid parameters',
  [StatusCode.UNAUTHORIZED]: 'Authentication is required and has failed or not been provided',
  [StatusCode.PAYMENT_REQUIRED]: 'Payment is required to access this resource',
  [StatusCode.FORBIDDEN]: 'The server understands the request but refuses to authorize it',
  [StatusCode.NOT_FOUND]: 'The requested resource could not be found',
  [StatusCode.METHOD_NOT_ALLOWED]: 'The HTTP method is not allowed for this resource',
  [StatusCode.NOT_ACCEPTABLE]: 'The resource cannot generate content acceptable to the client',
  [StatusCode.REQUEST_TIMEOUT]: 'The server timed out waiting for the request',
  [StatusCode.CONFLICT]: 'The request conflicts with the current state of the server',
  [StatusCode.GONE]: 'The requested resource is no longer available and will not be available again',
  [StatusCode.UNPROCESSABLE_ENTITY]: 'The request is well-formed but contains semantic errors',
  [StatusCode.TOO_MANY_REQUESTS]: 'Too many requests have been sent in a given timeframe',

  // 5xx Server Errors
  [StatusCode.INTERNAL_SERVER_ERROR]: 'The server encountered an unexpected condition',
  [StatusCode.NOT_IMPLEMENTED]: 'The server does not support the functionality required',
  [StatusCode.BAD_GATEWAY]: 'The server received an invalid response from an upstream server',
  [StatusCode.SERVICE_UNAVAILABLE]: 'The server is temporarily unable to handle the request',
  [StatusCode.GATEWAY_TIMEOUT]: 'The server did not receive a timely response from an upstream server',
};

/**
 * Helper function to check if a status code indicates success (2xx)
 */
export function isSuccessStatus(statusCode: StatusCode): boolean {
  return statusCode >= 200 && statusCode < 300;
}

/**
 * Helper function to check if a status code indicates a client error (4xx)
 */
export function isClientError(statusCode: StatusCode): boolean {
  return statusCode >= 400 && statusCode < 500;
}

/**
 * Helper function to check if a status code indicates a server error (5xx)
 */
export function isServerError(statusCode: StatusCode): boolean {
  return statusCode >= 500 && statusCode < 600;
}

/**
 * Helper function to get the description for a status code
 */
export function getStatusDescription(statusCode: StatusCode): string {
  return StatusCodeDescription[statusCode] || 'Unknown status code';
}

/**
 * Standardized error response structure
 */
export interface ErrorResponse {
  statusCode: StatusCode;
  error: string;
  message: string;
  details?: unknown;
  timestamp: string;
  path?: string;
  requestId?: string;
}

/**
 * Custom API Error class for throwing typed errors
 */
export class ApiError extends Error {
  public readonly statusCode: StatusCode;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

  constructor(
    statusCode: StatusCode,
    message: string,
    details?: unknown,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where error was thrown (Node.js only)
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, this.constructor);
    }
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  /**
   * Convert the error to a standardized response format
   */
  toResponse(path?: string, requestId?: string): ErrorResponse {
    return createErrorResponse(
      this.statusCode,
      this.message,
      this.details,
      path,
      requestId
    );
  }
}

/**
 * Creates a standardized error response object
 */
export function createErrorResponse(
  statusCode: StatusCode,
  message: string,
  details?: unknown,
  path?: string,
  requestId?: string
): ErrorResponse {
  return {
    statusCode,
    error: StatusCodeDescription[statusCode] || 'Unknown Error',
    message,
    details,
    timestamp: new Date().toISOString(),
    path,
    requestId,
  };
}

/**
 * Pre-built error factory functions for common errors
 */
export const ErrorFactory = {
  badRequest: (message: string, details?: unknown) =>
    new ApiError(StatusCode.BAD_REQUEST, message, details),

  unauthorized: (message = 'Authentication required', details?: unknown) =>
    new ApiError(StatusCode.UNAUTHORIZED, message, details),

  forbidden: (message = 'Access denied', details?: unknown) =>
    new ApiError(StatusCode.FORBIDDEN, message, details),

  notFound: (resource: string, details?: unknown) =>
    new ApiError(StatusCode.NOT_FOUND, `${resource} not found`, details),

  conflict: (message: string, details?: unknown) =>
    new ApiError(StatusCode.CONFLICT, message, details),

  unprocessableEntity: (message: string, details?: unknown) =>
    new ApiError(StatusCode.UNPROCESSABLE_ENTITY, message, details),

  tooManyRequests: (message = 'Rate limit exceeded', details?: unknown) =>
    new ApiError(StatusCode.TOO_MANY_REQUESTS, message, details),

  internalServerError: (message = 'Internal server error', details?: unknown) =>
    new ApiError(StatusCode.INTERNAL_SERVER_ERROR, message, details, false),

  serviceUnavailable: (message = 'Service temporarily unavailable', details?: unknown) =>
    new ApiError(StatusCode.SERVICE_UNAVAILABLE, message, details, false),

  gatewayTimeout: (message = 'Gateway timeout', details?: unknown) =>
    new ApiError(StatusCode.GATEWAY_TIMEOUT, message, details, false),
};

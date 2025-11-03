import { z, ZodError } from 'zod';

/**
 * Validation result type
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}

/**
 * Format Zod validation errors into readable messages
 */
function formatZodErrors(error: ZodError): string[] {
  return error.errors.map((err) => {
    const path = err.path.join('.');
    return path ? `${path}: ${err.message}` : err.message;
  });
}

/**
 * Validate request body using Zod schema
 * @param schema - The Zod schema to validate against
 * @param body - The request body to validate
 * @returns ValidationResult with typed data or errors
 */
export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): ValidationResult<T> {
  try {
    const data = schema.parse(body);
    return {
      success: true,
      data,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        errors: formatZodErrors(error),
      };
    }
    return {
      success: false,
      errors: ['Invalid request body format'],
    };
  }
}

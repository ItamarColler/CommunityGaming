import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * MSW server for Node.js tests
 * Intercepts HTTP requests during testing
 */
export const server = setupServer(...handlers);

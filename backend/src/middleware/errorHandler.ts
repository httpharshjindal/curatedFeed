// src/middleware/errorHandler.ts
import type { MiddlewareHandler } from 'hono';

export const errorHandler: MiddlewareHandler = async (c, next) => {
  try {
    await next();
  } catch (err) {
    console.error('Error encountered:', err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
};

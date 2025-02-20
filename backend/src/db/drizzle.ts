import pg from "pg";
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import 'dotenv/config';

// Initialize the connection pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test the connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client', err.stack);
    return;
  }
  console.log('Successfully connected to database');
  release();
});

// Create the drizzle database instance
export const db = drizzle(pool, { schema });

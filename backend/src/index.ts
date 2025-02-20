import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { errorHandler } from './middleware/errorHandler';
import articlesRoute from './routes/articles';
import usersRoute from './routes/users';
import bookmarksRoute from './routes/bookmarks';
import { startArticleFetcher } from './cron/fetchArticles';
import { fetchAndStoreArticles } from './services/articleService';
import 'dotenv/config';

const app = new Hono();

// Global middleware
app.use('*', logger());
app.use('*', cors());
app.use('*', errorHandler);

// API Routes
app.route('/api/articles', articlesRoute);
app.route('/api/users', usersRoute);
app.route('/api/bookmarks', bookmarksRoute);

// Health check endpoint
app.get('/', (c) => c.json({ status: 'Server is running!' }));

// Start the server
const port = process.env.PORT || 3001;
serve({
  fetch: app.fetch,
  port: Number(port),
}, async (info) => {
  console.log(`🚀 Server is running on port ${info.port}`);
  
  try {
    // Initial article fetch
    console.log('Starting initial article fetch...');
    await fetchAndStoreArticles();
    console.log('✅ Initial article fetch completed');
    
    // Start cron job for periodic article fetching
    console.log('Starting article fetcher cron job...');
    startArticleFetcher();
    console.log('✅ Cron job initialized');
  } catch (error) {
    console.error('❌ Error during startup:', error);
  }
});

// Handle graceful shutdown
const shutdown = () => {
  console.log('Shutting down server...');
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
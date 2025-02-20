// src/cron/fetchArticles.ts
import cron from 'node-cron';
import { fetchAndStoreArticles } from '../services/articleService';

export const startArticleFetcher = () => {
  // Schedule to run every minute
  cron.schedule('0 * * * *', async () => {
    console.log('🔄 Cron job running: Fetching latest articles...');
    try {
      await fetchAndStoreArticles();
      console.log('✅ Articles fetch completed');
    } catch (error) {
      console.error('❌ Error fetching articles:', error);
    }
  });
};

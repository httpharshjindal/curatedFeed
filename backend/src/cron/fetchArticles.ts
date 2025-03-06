// src/cron/articleCron.ts
import { CronJob } from "cron";
import { runArticleProcessingWorkflow } from "../services/articleService";

// Run every hour
export const articleProcessingJob = new CronJob(
  "0 * * * *", // Runs at the top of every hour
  async function() {
    console.log(`Article processing cron job started at ${new Date().toISOString()}`);
    try {
      await runArticleProcessingWorkflow();
      console.log(`Article processing cron job completed at ${new Date().toISOString()}`);
    } catch (error) {
      console.error("Error in article processing cron job:", error);
    }
  },
  null, // onComplete
  false, // start
  "UTC" // timezone
);

// Start the cron job
export const startArticleCronJobs = () => {
  articleProcessingJob.start();
  console.log("Article processing cron job scheduled");
};
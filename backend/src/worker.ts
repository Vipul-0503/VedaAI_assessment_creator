import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || '';

const redisConnection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

// Initialize the worker to process jobs from the 'assessment-generation' queue
export const startWorker = () => {
  const worker = new Worker(
    'assessment-generation',
    async (job: Job) => {
      console.log(`Processing background job ${job.id} for assessment: ${job.data.title}`);
      
      // TODO: This is where we will call the Gemini AI API tomorrow!
      console.log(`Successfully completed generation for ${job.data.title}`);
    },
    { connection: redisConnection }
  );

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} has completed successfully.`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed with error: ${err.message}`);
  });

  console.log('Background Worker registered and listening for jobs...');
};
import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { Assessment } from './models/Assessment';
import { Question } from './models/Question';

dotenv.config();

// 1. Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const redisConnection = new IORedis(process.env.REDIS_URL || '', {
  maxRetriesPerRequest: null,
});

export const startWorker = () => {
  const worker = new Worker(
    'assessment-generation',
    async (job: Job) => {
      const { assessmentId, title, topic, difficulty } = job.data;
      console.log(`\nProcessing AI generation for Assessment: "${title}" (ID: ${assessmentId})`);

      try {
        // 2. Draft the specialized generation prompt
        const prompt = `
          You are an expert examiner. Generate exactly 5 challenging multiple-choice questions (MCQs) for an assessment.
          
          Topic: ${topic}
          Target Difficulty Level: ${difficulty}
          
          Requirements for each question:
          - The question must be highly relevant to the topic.
          - Provide exactly 4 options.
          - Specify the exact correct answer text (matching one of the options).
          - Provide a clear explanation of why that answer is correct.
        `;

        // 3. Call Gemini with Strict JSON Output Schema
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      questionText: { type: Type.STRING },
                      options: { 
                        type: Type.ARRAY, 
                        items: { type: Type.STRING } 
                      },
                      correctAnswer: { type: Type.STRING },
                      explanation: { type: Type.STRING }
                    },
                    required: ['questionText', 'options', 'correctAnswer', 'explanation'],
                  }
                }
              },
              required: ['questions'],
            }
          }
        });

        // 4. Parse the AI result securely
        const responseText = response.text;
        if (!responseText) {
          throw new Error('Gemini AI returned an empty response.');
        }

        const data = JSON.parse(responseText);
        const aiQuestions = data.questions;

        console.log(`Generated ${aiQuestions.length} questions successfully from Gemini.`);

        // 5. Bulk insert questions into MongoDB mapped to this assessment
        const questionDocs = aiQuestions.map((q: any) => ({
          assessmentId,
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          questionType: 'mcq',
          sectionName: 'Core Concepts',
        }));

        const savedQuestions = await Question.insertMany(questionDocs);
        const questionIds = savedQuestions.map(doc => doc._id);

        // 6. Link question IDs back to the master Assessment and flip status to 'completed'
        await Assessment.findByIdAndUpdate(assessmentId, {
          questions: questionIds,
          status: 'completed',
        });

        console.log(`Saved questions to DB and marked Assessment ${assessmentId} as completed!`);

      } catch (err: any) {
        console.error(`Failed to process job ${job.id}:`, err);
        
        // Update assessment status to failed if generation crashes
        await Assessment.findByIdAndUpdate(assessmentId, { status: 'failed' });
        throw err;
      }
    },
    { connection: redisConnection }
  );

  worker.on('completed', (job) => {
    console.log(`Background Job ${job.id} finalized successfully.`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Background Job ${job?.id} failed out permanently:`, err.message);
  });

  console.log('Background Worker registered and listening for AI generation jobs...');
};
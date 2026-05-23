import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { Assessment } from './models/Assessment';
import { Question } from './models/Question';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const redisConnection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null,
});

export const startWorker = () => {
  console.log("BullMQ Worker initialization listener started...");

  const worker = new Worker(
    'assessment-generation',
    async (job: Job) => {
      // additionalInfo extracted from the payload
      const { assessmentId, difficulty, questionConfigs, file, additionalInfo } = job.data;
      console.log(`\n==================================================`);
      console.log(`[Job ${job.id}] Started processing for Assessment ID: ${assessmentId}`);
      console.log(`Teacher Notes / Instructions: "${additionalInfo || 'None provided'}"`);

      try {
        console.log("Checkpoint 1: Parsing configurations...");
        const configurations = questionConfigs && questionConfigs.length > 0 ? questionConfigs : [];

        const configPrompt = configurations.map((c: any) => 
          `- ${c.count} x "${c.type}" (worth ${c.marks} marks each)`
        ).join('\n');

        // Reference file text placeholder if available
        const fileContext = file ? `Reference File Name Provided: ${file.originalname}.` : '';

        // PROMPT ENGINEERING: Injecting additionalInfo purely to guide custom generation behavior
        const prompt = `
          You are an expert academic examiner building an official exam paper.
          
          Context & Source Material:
          ${fileContext}
          
          CRITICAL TEACHER INSTRUCTIONS (Incorporate these requirements perfectly into the question styles):
          "${additionalInfo || 'Generate standard textbook concept questions on the general topic of the document.'}"
          
          Target Difficulty Level: ${difficulty}
          
          You MUST generate a JSON object matching this structural request distribution:
          ${configPrompt}
          
          CRITICAL GENERATION INSTRUCTIONS:
          1. Auto-generate a clean, concise, professional academic title (3-5 words max) for this assessment based on the instructions or file name. Do not include quotes.
          2. For non-MCQ question types (Short Questions, Numerical, Diagram-Based, etc.), provide an empty string array [] for the "options" field.
          3. Ensure the "marks" field value matches requested rules perfectly.
        `;

        console.log("Checkpoint 2: Calling Gemini AI API model engine...");
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash', 
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                // FIXED: Gemini will now dynamically output a professional title object
                assessmentTitle: { type: Type.STRING, description: "A concise, professional title summarizing this exam paper." },
                questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      questionText: { type: Type.STRING },
                      options: { type: Type.ARRAY, items: { type: Type.STRING } },
                      correctAnswer: { type: Type.STRING },
                      explanation: { type: Type.STRING },
                      marks: { type: Type.NUMBER },
                      questionType: { type: Type.STRING }
                    },
                    required: ['questionText', 'options', 'correctAnswer', 'explanation', 'marks', 'questionType'],
                  }
                }
              },
              required: ['assessmentTitle', 'questions'],
            }
          }
        });

        console.log("Checkpoint 3: Gemini responded successfully. Parsing text string...");
        const responseText = response.text;
        if (!responseText) throw new Error('Gemini AI returned a completely empty text stream.');

        const data = JSON.parse(responseText);
        const aiQuestions = data.questions;
        const generatedTitle = data.assessmentTitle || "Untitled AI Assessment";

        console.log(`AI Generated Title: "${generatedTitle}"`);

        if (!aiQuestions || !Array.isArray(aiQuestions)) {
          throw new Error("Parsed JSON does not contain a valid 'questions' array object.");
        }

        console.log(`Checkpoint 4: Mapping ${aiQuestions.length} parsed AI questions to MongoDB documents...`);
        
        const mapToDatabaseEnum = (typeStr: string): 'mcq' | 'subjective' | 'coding' => {
          const cleaned = typeStr.toLowerCase().trim();
          if (cleaned.includes('choice') || cleaned.includes('mcq')) return 'mcq'; 
          if (cleaned.includes('coding') || cleaned.includes('program')) return 'coding';
          return 'subjective'; 
        };

        const questionDocs = aiQuestions.map((q: any) => ({
          assessmentId,
          questionText: q.questionText || "Sample Question Description Entry",
          options: mapToDatabaseEnum(q.questionType) === 'mcq' && Array.isArray(q.options) ? q.options : undefined,
          correctAnswer: q.correctAnswer || "Solution reference placeholder",
          explanation: q.explanation || "No clarification provided.",
          questionType: mapToDatabaseEnum(q.questionType), 
          marks: Number(q.marks) || 1,
          sectionName: q.questionType || 'Core Concepts',
        }));

        const savedQuestions = await Question.insertMany(questionDocs);
        const questionIds = savedQuestions.map(doc => doc._id);

        console.log("Checkpoint 5: Updating Assessment status and setting title to completed...");
        
        // Updates BOTH the dynamic questions array, status, AND saves the new clean generated title!
        await Assessment.findByIdAndUpdate(assessmentId, {
          title: generatedTitle,
          topic: generatedTitle,
          questions: questionIds,
          status: 'completed',
        });

        console.log(`Success! Worker finished processing job ${job.id}`);
        console.log(`==================================================`);

      } catch (err: any) {
        console.error(`\nWORKER CRASHED AT A CHECKPOINT! Job ID ${job.id} failed.`);
        console.error(`Error Message:`, err.message);
        
        await Assessment.findByIdAndUpdate(assessmentId, { status: 'failed' });
        throw err;
      }
    },
    { connection: redisConnection }
  );

  worker.on('completed', (job) => console.log(`Job ${job.id} finalized event emitted.`));
  worker.on('failed', (job, err) => console.error(`Job ${job?.id} failed terminal execution event:`, err.message));
};
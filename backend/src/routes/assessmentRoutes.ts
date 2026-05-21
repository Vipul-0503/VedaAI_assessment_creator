import { Router, Request, Response } from 'express';
import { Assessment } from '../models/Assessment';
import { assessmentQueue } from '../queue';

const router = Router();

// POST /api/assessments - Trigger a new AI assessment generation
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, topic, difficulty, timeLimit } = req.body;

    // 1. Basic Validation
    if (!title || !topic || !difficulty) {
       res.status(400).json({ error: 'Title, topic, and difficulty are required fields.' });
       return;
    }

    // 2. Create a "pending" assessment entry in MongoDB
    const newAssessment = new Assessment({
      title,
      topic,
      difficulty,
      timeLimit: timeLimit || 60,
      status: 'pending',
    });

    await newAssessment.save();

    // 3. Push a job to the BullMQ queue for background processing
    const job = await assessmentQueue.add(`generate-${newAssessment._id}`, {
      assessmentId: newAssessment._id,
      title: newAssessment.title,
      topic: newAssessment.topic,
      difficulty: newAssessment.difficulty,
    });

    // 4. Respond to client instantly with a 201 Created status
    res.status(201).json({
      message: 'Assessment generation initialized in the background.',
      assessmentId: newAssessment._id,
      jobId: job.id,
    });
  } catch (error: any) {
    console.error('Error triggering assessment generation:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
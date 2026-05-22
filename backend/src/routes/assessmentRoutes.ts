import { Router, Request, Response } from 'express';
import { Assessment } from '../models/Assessment';
import { assessmentQueue } from '../queue';

const router = Router();

// 1. POST /api/assessments - Trigger a new AI assessment generation
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, topic, difficulty, timeLimit } = req.body;

    if (!title || !topic || !difficulty) {
       res.status(400).json({ error: 'Title, topic, and difficulty are required fields.' });
       return;
    }

    const newAssessment = new Assessment({
      title,
      topic,
      difficulty,
      timeLimit: timeLimit || 60,
      status: 'pending',
    });

    await newAssessment.save();

    const job = await assessmentQueue.add(`generate-${newAssessment._id}`, {
      assessmentId: newAssessment._id,
      title: newAssessment.title,
      topic: newAssessment.topic,
      difficulty: newAssessment.difficulty,
    });

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

// 2. GET /api/assessments - Fetch a list of all assessments (for the dashboard)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    // Fetch all assessments, sort by newest first, and omit the full questions array for a lighter payload
    const assessments = await Assessment.find().sort({ createdAt: -1 }).select('-questions');
    res.status(200).json(assessments);
  } catch (error: any) {
    console.error('Error fetching assessments list:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. GET /api/assessments/:id - Fetch a single assessment along with its full questions
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Find the assessment and automatically populate its full array of associated question documents
    const assessment = await Assessment.findById(id).populate('questions');

    if (!assessment) {
       res.status(404).json({ error: 'Assessment profile not found.' });
       return;
    }

    res.status(200).json(assessment);
  } catch (error: any) {
    console.error('Error fetching assessment profile:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
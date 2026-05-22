import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { Assessment } from '../models/Assessment';
import { assessmentQueue } from '../queue';

const router = Router();

// Configure Multer storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Generate a secure, unique filename combining a timestamp and original name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// 1. POST /api/assessments - Trigger a new AI assessment generation (Accepts file upload)
router.post('/', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, topic, difficulty, timeLimit } = req.body;
    const file = req.file; // Accessed via Multer middleware

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

    // Prepare options for background processing worker
    const jobPayload: any = {
      assessmentId: newAssessment._id,
      title: newAssessment.title,
      topic: newAssessment.topic,
      difficulty: newAssessment.difficulty,
    };

    // If a document was successfully submitted, embed its file details into the background task
    if (file) {
      jobPayload.file = {
        path: file.path,
        originalname: file.originalname,
        mimetype: file.mimetype,
      };
    }

    const job = await assessmentQueue.add(`generate-${newAssessment._id}`, jobPayload);

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
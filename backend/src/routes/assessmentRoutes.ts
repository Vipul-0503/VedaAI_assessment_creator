import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { Assessment } from '../models/Assessment';
import { assessmentQueue } from '../queue';

const router = Router();

// Configure Multer storage engine to save files in the 'uploads/' folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// 1. POST /api/assessments - Trigger a new AI assessment generation
router.post('/', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    // FIXED: Destructured additionalInfo directly from the request body!
    const { title, topic, difficulty, timeLimit, questionConfigs, additionalInfo } = req.body;
    const file = req.file;

    // Build temporary fallbacks for the initial record so empty values don't crash validation
    const finalTitle = title || "Generating Title...";
    const finalTopic = topic || "Processing Document Content...";

    // Creating the initial assessment record in MongoDB
    const newAssessment = new Assessment({
      title: finalTitle,
      topic: finalTopic,
      difficulty: difficulty ? difficulty.toLowerCase() : 'medium',
      timeLimit: timeLimit ? Number(timeLimit) : 60,
      status: 'pending',
    });

    await newAssessment.save();

    // Prepare payload for the background processing worker
    const jobPayload: any = {
      assessmentId: newAssessment._id,
      difficulty: newAssessment.difficulty,
      questionConfigs: questionConfigs ? JSON.parse(questionConfigs) : [], 
      // FIXED: Attached additionalInfo into the job parameters safely!
      additionalInfo: additionalInfo || title || topic || '', 
    };

    // If a file was uploaded, attach its metadata so the worker can process it
    if (file) {
      jobPayload.file = {
        path: file.path,
        originalname: file.originalname,
        mimetype: file.mimetype,
      };
    }

    // Add the task to the queue for the worker to pick up
    const job = await assessmentQueue.add(`generate-${newAssessment._id}`, jobPayload);

    // CRITICAL REDIRECT PREPARATION: Return the full assessment object containing the fresh ID
    res.status(201).json(newAssessment);
    
  } catch (error: any) {
    console.error('Error triggering assessment generation:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. GET /api/assessments - Fetch all assessments list
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const assessments = await Assessment.find().sort({ createdAt: -1 }).select('-questions');
    res.status(200).json(assessments);
  } catch (error: any) {
    console.error('Error fetching assessments list:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. GET /api/assessments/:id - Fetch single assessment details
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
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
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
    const { title, topic, difficulty, timeLimit, questionConfigs, additionalInfo } = req.body;
    const file = req.file;

    const finalTitle = title || "Generating Title...";
    const finalTopic = topic || "Processing Document Content...";

    const newAssessment = new Assessment({
      title: finalTitle,
      topic: finalTopic,
      difficulty: difficulty ? difficulty.toLowerCase() : 'medium',
      timeLimit: timeLimit ? Number(timeLimit) : 60,
      status: 'pending',
    });

    await newAssessment.save();

    const jobPayload: any = {
      assessmentId: newAssessment._id,
      difficulty: newAssessment.difficulty,
      questionConfigs: questionConfigs ? JSON.parse(questionConfigs) : [], 
      additionalInfo: additionalInfo || title || topic || '', 
    };

    if (file) {
      jobPayload.file = {
        path: file.path,
        originalname: file.originalname,
        mimetype: file.mimetype,
      };
    }

    const job = await assessmentQueue.add(`generate-${newAssessment._id}`, jobPayload);

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

// 4. PATCH /api/assessments/:id - Rename an assessment title
router.patch('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title || title.trim() === '') {
      res.status(400).json({ error: 'Title is required for renaming.' });
      return;
    }

    const updatedAssessment = await Assessment.findByIdAndUpdate(
      id,
      { title: title.trim() },
      { new: true }
    );

    if (!updatedAssessment) {
      res.status(404).json({ error: 'Assessment profile not found.' });
      return;
    }

    res.status(200).json(updatedAssessment);
  } catch (error: any) {
    console.error('Error updating assessment title:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 5. DELETE /api/assessments/:id - Delete an assessment permanently
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const deletedAssessment = await Assessment.findByIdAndDelete(id);

    if (!deletedAssessment) {
      res.status(404).json({ error: 'Assessment profile not found.' });
      return;
    }

    res.status(200).json({ message: 'Assessment successfully deleted.' });
  } catch (error: any) {
    console.error('Error deleting assessment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
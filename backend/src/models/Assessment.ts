import { Schema, model, Document } from 'mongoose';

export interface IAssessment extends Document {
  title: string;
  description?: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number; // in minutes
  totalMarks: number;
  status: 'pending' | 'completed' | 'failed'; // Used to track BullMQ progress
  questions: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const AssessmentSchema = new Schema<IAssessment>(
  {
    title: { type: String, required: true },
    description: { type: String },
    topic: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    timeLimit: { type: Number, required: true, default: 60 },
    totalMarks: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    questions: [{ type: Schema.Types.ObjectId, ref: 'Question' }], 
  },
  { timestamps: true }
);

export const Assessment = model<IAssessment>('Assessment', AssessmentSchema);
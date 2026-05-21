// 1. FORCE NODE TO USE PUBLIC DNS (Fixes the Windows/ISP ECONNREFUSED bug)
import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']); 

// 2. YOUR EXISTING IMPORTS
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db';

import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Allows our server to read JSON bodies sent by the frontend

// Test Health Route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'VedaAI Backend Server is running smoothly!' });
});

// Start Server and Connect Databases
const startServer = async () => {
  // Connect to MongoDB Atlas
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server is blasting off on http://localhost:${PORT}`);
    console.log(`Health check ready at http://localhost:${PORT}/health`);
  });
};

startServer();
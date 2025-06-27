import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import deviceRoutes from './routes/deviceRoutes';
import { testConnection } from './config/sqlDb';

// Load environment variables
dotenv.config();

// Create Express application
const app: Application = express();

// Test SQL connection on startup
testConnection();

// Middleware
app.use(cors());
app.use(express.json());

// Serve device API at /api/devices
app.use('/api/devices', deviceRoutes);

// Serve static files from frontend build
app.use(express.static(path.join(__dirname, '../../dist')));

// Fallback to index.html for SPA routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

export default app;

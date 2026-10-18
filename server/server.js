import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import db, { initDatabase } from './config/database.js';
import { seedDatabase } from './config/seed.js';

import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profiles.js';
import skillRoutes from './routes/skills.js';
import endorsementRoutes from './routes/endorsements.js';
import assessmentRoutes from './routes/assessments.js';
import searchRoutes from './routes/search.js';
import adminRoutes from './routes/admin.js';
import notificationRoutes from './routes/notifications.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database & Seed sample records
initDatabase();
seedDatabase();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(uploadDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/endorsements', endorsementRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint (SRS P1 / System Monitoring)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Freelancer Skill Management System (FSMS)',
    version: '1.1.0',
    specification: 'IEEE 830 Standard',
  });
});

// Serve frontend static build in production (SPA fallback compatible with Express 5)
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  console.log(`🚀 Serving frontend client from ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      return res.sendFile(path.join(clientDistPath, 'index.html'));
    }
    next();
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`🚀 FSMS Server running at http://localhost:${PORT}`);
  console.log(`📋 Freelancer Skill Management System (SRS v1.1)`);
  console.log(`====================================================`);
});

export { app, server };

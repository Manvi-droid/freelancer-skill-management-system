import express from 'express';
import os from 'os';
import { getStorageStatus } from '../config/aws-s3.js';

const router = express.Router();

router.get('/status', (req, res) => {
  const memUsage = process.memoryUsage();
  const storageStatus = getStorageStatus();

  res.json({
    awsFreeTierCompatibility: {
      isFreeTierOptimized: true,
      computeTarget: 'AWS EC2 t2.micro / t3.micro (750 hours/month Free Tier eligible)',
      memoryFootprintMb: Math.round(memUsage.rss / (1024 * 1024)),
      memoryLimitAllowanceMb: 1024,
      memoryUtilizationPercent: `${((memUsage.rss / (1024 * 1024 * 1024)) * 100).toFixed(1)}% of 1GB Free Tier RAM`,
      osPlatform: `${os.type()} ${os.release()} (${os.arch()})`,
      uptimeSeconds: Math.round(process.uptime()),
    },
    cloudStorage: {
      ...storageStatus,
      freeTierAllowance: '5 GB Standard Storage, 20,000 GET requests, 2,000 PUT requests per month',
    },
    costGuardrails: [
      'Configured for zero paid services (embedded SQLite with WAL, no expensive RDS required)',
      'Single lightweight container architecture fitting comfortably in 1GB RAM without swap exhaustion',
      'S3 Free Tier integration for portfolio evidence with local fallback',
      'AWS Budgets recommended alert at $0.01 threshold for 100% cost peace-of-mind',
    ],
  });
});

export default router;

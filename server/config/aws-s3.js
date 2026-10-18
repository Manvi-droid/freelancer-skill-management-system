import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

const isAwsConfigured = Boolean(
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_S3_BUCKET
);

const region = process.env.AWS_REGION || 'us-east-1';
const bucketName = process.env.AWS_S3_BUCKET;

let s3Client = null;
if (isAwsConfigured) {
  try {
    s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    console.log(`☁️  Cloud S3 Client connected to bucket "${bucketName}" (Region: ${region})`);
  } catch (err) {
    console.warn('⚠️ Cloud S3 initialization skipped, falling back to local storage:', err.message);
  }
} else {
  console.log('📦 Evidence Storage ready: Local File Storage mode.');
}

/**
 * Uploads a file either to AWS S3 (Free Tier) or keeps it in local uploads/
 * @param {Object} file - Multer file object
 * @returns {Promise<{fileUrl: string, storageType: 's3'|'local', key: string}>}
 */
export async function uploadEvidenceFile(file) {
  if (isAwsConfigured && s3Client) {
    try {
      const fileStream = fs.createReadStream(file.path);
      const s3Key = `evidence/${Date.now()}-${path.basename(file.originalname).replace(/\s+/g, '_')}`;

      const uploadParams = {
        Bucket: bucketName,
        Key: s3Key,
        Body: fileStream,
        ContentType: file.mimetype,
      };

      await s3Client.send(new PutObjectCommand(uploadParams));

      // Clean up temporary local file after S3 upload
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${s3Key}`;
      return {
        fileUrl,
        storageType: 's3',
        key: s3Key,
      };
    } catch (error) {
      console.error('Error uploading to AWS S3, falling back to local file:', error);
      // Fallback to local
      return {
        fileUrl: `/uploads/${file.filename}`,
        storageType: 'local',
        key: file.filename,
      };
    }
  }

  // Local storage mode
  return {
    fileUrl: `/uploads/${file.filename}`,
    storageType: 'local',
    key: file.filename,
  };
}

/**
 * Returns current AWS Free Tier integration status
 */
export function getStorageStatus() {
  return {
    isAwsConfigured,
    provider: isAwsConfigured ? 'AWS S3 (Free Tier 5GB)' : 'Local File Storage',
    bucket: bucketName || 'N/A (Local /uploads)',
    region: isAwsConfigured ? region : 'N/A',
  };
}

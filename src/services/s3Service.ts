import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const generatePresignedUrl = async (
  fileName: string,
  fileType: string,
  isPublic: boolean = false
) => {
  const folder = isPublic ? 'public/cars' : 'private/docs';

  const cleanFileName = fileName.replace(/\s+/g, '-').replace(/[()]/g, '');

  const key = `${folder}/${Date.now()}-${cleanFileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 * 5 });

  return { uploadUrl, key };
};

export const generateViewPresignedUrl = async (key: string) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
  });

  const url = await getSignedUrl(s3, command, {
    expiresIn: 60 * 5,
  });

  return { url };
};

export const generateViewRecieptPresignedUrl = async (key: string): Promise<string> => {
  const expiresIn = Number(process.env.S3_PRESIGNED_URL_EXPIRY || 60);

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
  });

  return getSignedUrl(s3, command, { expiresIn });
};

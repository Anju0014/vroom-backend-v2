import express, { Request, Response, Router } from 'express';
import { generatePresignedUrl, generateViewPresignedUrl } from '@services/s3Service';
import { StatusCode } from '@constants/statusCode';

const router: Router = express.Router();

router.post('/generate-upload-url', async (req: Request, res: Response): Promise<void> => {
  const { fileName, fileType } = req.body;
  if (!fileName || !fileType) {
    res.status(StatusCode.BAD_REQUEST).json({ error: 'Missing parameters' });
    return;
  }
  try {
    const { url, key } = await generatePresignedUrl(fileName, fileType);
    res.json({ url, key });
  } catch (error) {
    console.error(error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ error: 'Failed to generate URL' });
  }
});

router.get('/generate-view-url', async (req: Request, res: Response) => {
  const { key } = req.query;

  if (!key) {
    res.status(StatusCode.BAD_REQUEST).json({ error: 'Missing key' });
    return;
  }

  try {
    const { url } = await generateViewPresignedUrl(key as string);
    res.json({ url });
  } catch (error) {
    console.error(error);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ error: 'Failed to generate view URL' });
  }
});

export default router;

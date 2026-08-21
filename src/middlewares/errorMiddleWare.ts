import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@utils/apiError';
import { StatusCode } from '@constants/statusCode';
import logger from '@utils/logger';

export const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
 _next: NextFunction
): void => {
  logger.error(' Error:', err);

  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

    if (err instanceof Error) {
    logger.error(err.stack);

    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: err.message,
    });
    return;
  }
  
  res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: 'Something went wrong',
  });
  
};

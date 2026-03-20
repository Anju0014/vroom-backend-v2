import { Response, Request, NextFunction } from 'express';
import { StatusCode } from '@constants/statusCode';

import INotificationController from '@controllers/interfaces/notification/INotificationController';
import { INotificationService } from '@services/interfaces/notification/INotificationServices';
import { MESSAGES } from '@constants/message';
import logger from '@utils/logger';
import { ApiError } from '@utils/apiError';

class NotificationController implements INotificationController {
  private _notificationService: INotificationService;

  constructor(_notificationService: INotificationService) {
    this._notificationService = _notificationService;
  }

  async createNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notification = await this._notificationService.create(req.body);

      res.status(StatusCode.CREATED).json({
        success: true,
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  }

  async getByUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.query.userId as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!userId) {
        throw new ApiError(StatusCode.BAD_REQUEST, MESSAGES.ERROR.MISSING_FIELDS);
        logger.warn('No user');
        res.status(StatusCode.BAD_REQUEST).json({ message: 'UserId is required' });
        return;
      }

      const result = await this._notificationService.getByUserId(userId, page, limit);

      res.status(StatusCode.OK).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        throw new ApiError(StatusCode.BAD_REQUEST, MESSAGES.ERROR.MISSING_FIELDS);
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'userid is required',
        });
        return;
      }

      await this._notificationService.markAllAsRead(userId);
      res.status(StatusCode.OK).json({
        success: true,
        // data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notifId = req.query.notifId as string;
      if (!notifId) {
        throw new ApiError(StatusCode.BAD_REQUEST, MESSAGES.ERROR.MISSING_FIELDS);
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'notifid is required',
        });
        return;
      }

      await this._notificationService.markAsRead(notifId);
      res.status(StatusCode.OK).json({
        success: true,
        // data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
  async getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.query.userId as string;

      if (!userId) {
        throw new ApiError(StatusCode.BAD_REQUEST, MESSAGES.ERROR.MISSING_FIELDS);
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'userId is required',
        });
        return;
      }

      const count = await this._notificationService.getUnReadCount(userId);

      res.status(StatusCode.OK).json({
        success: true,
        count,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default NotificationController;

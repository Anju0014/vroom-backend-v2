import { NextFunction, Request, Response } from 'express';

interface INotificationController {
  createNotification(req: Request, res: Response, next: NextFunction): Promise<void>;
  getByUser(req: Request, res: Response, next: NextFunction): Promise<void>;
  markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void>;
  markAsRead(req: Request, res: Response, next: NextFunction): Promise<void>;
  getUnreadCount(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export default INotificationController;

import { Router } from 'express';
import NotificationController from '@controllers/implementation/notification/notificationController';
import NotificationService from '@services/implementation/notification/notificationServices';
import NotificationRepository from '@repositories/implementation/notification/notificationRepository';
const notificationRouter = Router();

const notificationRepository = new NotificationRepository();
const notificationService = new NotificationService(notificationRepository);
const notificationController = new NotificationController(notificationService);

notificationRouter.post('/', (req, res, next) =>
  notificationController.createNotification(req, res, next)
);

notificationRouter.get('/', (req, res, next) => notificationController.getByUser(req, res, next));

notificationRouter.patch('/mark-all-read', (req, res, next) =>
  notificationController.markAllAsRead(req, res, next)
);
notificationRouter.patch('/mark-read', (req, res, next) =>
  notificationController.markAsRead(req, res, next)
);

notificationRouter.get('/unread-count', (req, res, next) =>
  notificationController.getUnreadCount(req, res, next)
);

export default notificationRouter;

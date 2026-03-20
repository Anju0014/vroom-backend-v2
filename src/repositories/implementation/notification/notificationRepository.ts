import { Notification, INotification } from '@models/notification/notificationModel';
import { BaseRepository } from '@repositories/base/BaseRepository';
import INotificationRepository from '@repositories/interfaces/notification/INotificationRepository';

export class NotificationRepository
  extends BaseRepository<INotification>
  implements INotificationRepository
{
  constructor() {
    super(Notification);
  }

  async create(data: Partial<INotification>): Promise<INotification> {
    return await Notification.create(data);
  }

  async findByUserId(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ notifications: INotification[]; total: number }> {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),

      Notification.countDocuments({ userId }),
    ]);

    return { notifications, total };
  }

  async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany({ userId, isRead: false }, { $set: { isRead: true } });
    return;
  }
  async markAsRead(notifId: string): Promise<void> {
    await Notification.findOneAndUpdate(
      { _id: notifId, isRead: false },
      { $set: { isRead: true } }
    );
    return;
  }

  async getUnReadCount(userId: string): Promise<number> {
    return await Notification.countDocuments({ userId, isRead: false });
  }
}
export default NotificationRepository;

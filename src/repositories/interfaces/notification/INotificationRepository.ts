import { INotification } from '@models/notification/notificationModel';
interface INotificationRepository {
  create(data: Partial<INotification>): Promise<INotification>;
  findByUserId(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ notifications: INotification[]; total: number }>;
  markAllAsRead(userId: string): Promise<void>;
  markAsRead(notifId: string): Promise<void>;
  getUnReadCount(userId: string): Promise<number>;
}
export default INotificationRepository;

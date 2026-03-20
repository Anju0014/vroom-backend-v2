import { CreateNotificationDto, NotificationResponseDto } from '@dtos/notification.dto';
export interface INotificationService {
  create(dto: CreateNotificationDto): Promise<NotificationResponseDto>;
  getByUserId(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ data: NotificationResponseDto[]; total: number; page: number; totalPages: number }>;
  markAllAsRead(userId: string): Promise<void>;
  markAsRead(notifId: string): Promise<void>;
  getUnReadCount(userId: string): Promise<number>;
}

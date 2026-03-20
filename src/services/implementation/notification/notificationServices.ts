import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateNotificationDto, NotificationResponseDto } from '@dtos/notification.dto';
import { NotificationMapper } from '@mappers/notification.mapper';
import INotificationRepository from '@repositories/interfaces/notification/INotificationRepository';
import { INotificationService } from '@services/interfaces/notification/INotificationServices';
import { getIO } from '@sockets/socket';

class NotificationService implements INotificationService {
  private _notificationRepository: INotificationRepository;

  constructor(notificationRepository: INotificationRepository) {
    this._notificationRepository = notificationRepository;
  }

  async create(dto: CreateNotificationDto): Promise<NotificationResponseDto> {
    const validated = plainToInstance(CreateNotificationDto, dto);
    await validateOrReject(validated);

    const notification = await this._notificationRepository.create(validated);
    const responseDto = NotificationMapper.toDto(notification);

    const io = getIO();
    io.to(dto.userId).emit('newNotification', responseDto);
    return responseDto;
  }

  async getByUserId(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ data: NotificationResponseDto[]; total: number; page: number; totalPages: number }> {
    const { notifications, total } = await this._notificationRepository.findByUserId(
      userId,
      page,
      limit
    );

    const dto = NotificationMapper.toDtoArray(notifications);

    return {
      data: dto,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this._notificationRepository.markAllAsRead(userId);
  }
  async markAsRead(notifId: string): Promise<void> {
    await this._notificationRepository.markAsRead(notifId);
  }

  async getUnReadCount(userId: string): Promise<number> {
    return await this._notificationRepository.getUnReadCount(userId);
  }
}
export default NotificationService;

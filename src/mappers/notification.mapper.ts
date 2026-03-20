import { plainToInstance } from 'class-transformer';
import { NotificationResponseDto } from '@dtos/notification.dto';
import { INotification } from '@models/notification/notificationModel';

export class NotificationMapper {
  static toDto(entity: INotification): NotificationResponseDto {
    return plainToInstance(
      NotificationResponseDto,
      {
        id: entity._id.toString(),
        userId: entity.userId,
        role: entity.role,
        title: entity.title,
        message: entity.message,
        type: entity.type,
        iconKey: entity.iconKey,
        severity: entity.severity,
        metadata: entity.metadata,
        isRead: entity.isRead,
        createdAt: entity.createdAt,
      },
      { excludeExtraneousValues: true }
    );
  }

  static toDtoArray(entities: INotification[]): NotificationResponseDto[] {
    return entities.map((entity) => this.toDto(entity));
  }
}

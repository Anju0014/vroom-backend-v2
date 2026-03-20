import { IsString, IsOptional, IsIn } from 'class-validator';
import { Expose, Type } from 'class-transformer';

export class CreateNotificationDto {
  @IsString()
  userId!: string;

  @IsIn(['ADMIN', 'OWNER', 'CUSTOMER'])
  role!: 'ADMIN' | 'OWNER' | 'CUSTOMER';

  @IsString()
  title!: string;

  @IsString()
  message!: string;

  @IsString()
  type!: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
export class NotificationResponseDto {
  @Expose() id!: string;
  @Expose() userId!: string;
  @Expose() role!: string;
  @Expose() title!: string;
  @Expose() message!: string;
  @Expose() type!: string;
  @Expose() iconKey!: string;
  @Expose() severity!: string;
  @Expose() metadata?: Record<string, any>;
  @Expose() isRead!: boolean;
  @Expose() @Type(() => Date) createdAt!: Date;
}

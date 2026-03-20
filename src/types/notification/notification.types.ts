import {
  NotificationIconKey,
  NotificationSeverity,
  NotificationType,
} from '@app-types/notification/notification.enums';

export interface NotificationPayload {
  userId: string;
  role: 'ADMIN' | 'OWNER' | 'CUSTOMER';
  title: string;
  message: string;
  type: NotificationType;
  severity: NotificationSeverity;
  iconKey: NotificationIconKey;
  metadata?: Record<string, any>;
}

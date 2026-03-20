export enum NotificationType {
  BOOKING_CONFIRMED = 'booking_confirmed',
  BOOKING_REJECTED = 'booking_rejected',
  PAYMENT_SUCCESS = 'payment_success',
  TRIP_REMINDER = 'trip_reminder',

  BOOKING_REQUEST = 'booking_request',
  BOOKING_CANCELLED = 'booking_cancelled',

  PAYMENT_CREDITED = 'payment_credited',

  CAR_VERIFICATION = 'car_verification',
  CAR_APPROVAL_PENDING = 'car_approval_pending',
  CAR_OWNER_APPROVAL_PENDING = 'carowner_approval_pending',

  DISPUTE_REPORTED = 'dispute_reported',
  HIGH_PRIORITY_ISSUE = 'high_priority_issue',
}

export enum NotificationSeverity {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

export enum NotificationIconKey {
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
  BOOKING_REJECTED = 'BOOKING_REJECTED',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  PAYMENT_CREDITED = 'PAYMENT_CREDITED',

  TRIP_REMINDER = 'TRIP_REMINDER',
  BOOKING_REQUEST = 'BOOKING_REQUEST',
  BOOKING_CANCELLED = 'BOOKING_CANCELLED',

  CAR_APPROVED = 'CAR_APPROVED',
  CAR_REJECTED = 'CAR_REJECTED',
  CAR_APPROVAL_PENDING = 'CAR_APPROVAL_PENDING',
  CAR_OWNER_APPROVAL = 'CAR_OWNER_APPROVAL',

  ALERT = 'ALERT',
  DISPUTE_REPORTED = 'DISPUTE_REPORTED',
}

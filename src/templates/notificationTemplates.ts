import { NotificationPayload } from '@app-types/notification/notification.types';
import {
  NotificationSeverity,
  NotificationIconKey,
  NotificationType,
} from '@app-types/notification/notification.enums';

export const NotificationTemplates = {
  /* ========================= CUSTOMER ========================= */

  bookingConfirmed(
    customerId: string,
    bookingId: string,
    carModel: string,
    startDate: Date,
    endDate: Date
  ): NotificationPayload {
    return {
      userId: customerId,
      role: 'CUSTOMER',
      title: 'Booking Confirmed',
      message: `Your booking for ${carModel} is confirmed from ${startDate.toDateString()} to ${endDate.toDateString()}.`,
      type: NotificationType.BOOKING_CONFIRMED,
      severity: NotificationSeverity.SUCCESS,
      iconKey: NotificationIconKey.BOOKING_CONFIRMED,
      metadata: { bookingId },
    };
  },

  bookingRejected(
    customerId: string,
    bookingId: string,
    carModel: string,
    reason?: string
  ): NotificationPayload {
    return {
      userId: customerId,
      role: 'CUSTOMER',
      title: 'Booking Rejected',
      message: `Your booking for ${carModel} was rejected.${reason ? ` Reason: ${reason}` : ''}`,
      type: NotificationType.BOOKING_REJECTED,
      severity: NotificationSeverity.ERROR,
      iconKey: NotificationIconKey.BOOKING_REJECTED,
      metadata: { bookingId, reason },
    };
  },

  paymentSuccess(customerId: string, bookingId: string, amount: number): NotificationPayload {
    return {
      userId: customerId,
      role: 'CUSTOMER',
      title: 'Payment Successful',
      message: `Your payment of ₹${amount} was successful.`,
      type: NotificationType.PAYMENT_SUCCESS,
      severity: NotificationSeverity.SUCCESS,
      iconKey: NotificationIconKey.PAYMENT_SUCCESS,
      metadata: { bookingId, amount },
    };
  },

  tripReminder(
    customerId: string,
    bookingId: string,
    carModel: string,
    reminderType: 'START' | 'END',
    date: Date
  ): NotificationPayload {
    return {
      userId: customerId,
      role: 'CUSTOMER',
      title: reminderType === 'START' ? 'Trip Starting Soon' : 'Trip Ending Soon',
      message:
        reminderType === 'START'
          ? `Your trip with ${carModel} starts on ${date.toDateString()}.`
          : `Your trip with ${carModel} ends on ${date.toDateString()}.`,
      type: NotificationType.TRIP_REMINDER,
      severity: NotificationSeverity.INFO,
      iconKey: NotificationIconKey.TRIP_REMINDER,
      metadata: { bookingId, reminderType },
    };
  },

  /* ========================= OWNER ========================= */

  bookingRequest(ownerId: string, bookingId: string, carModel: string): NotificationPayload {
    return {
      userId: ownerId,
      role: 'OWNER',
      title: 'New Booking Request',
      message: `A customer wants to book your ${carModel}.`,
      type: NotificationType.BOOKING_REQUEST,
      severity: NotificationSeverity.INFO,
      iconKey: NotificationIconKey.BOOKING_REQUEST,
      metadata: { bookingId },
    };
  },

  bookingCanceledByCustomer(
    ownerId: string,
    bookingId: string,
    carModel: string
  ): NotificationPayload {
    return {
      userId: ownerId,
      role: 'OWNER',
      title: 'Booking Cancelled',
      message: `The booking for ${carModel} has been cancelled by the customer.`,
      type: NotificationType.BOOKING_CANCELLED,
      severity: NotificationSeverity.WARNING,
      iconKey: NotificationIconKey.BOOKING_CANCELLED,
      metadata: { bookingId },
    };
  },

  paymentCredited(ownerId: string, bookingId: string, amount: number): NotificationPayload {
    return {
      userId: ownerId,
      role: 'OWNER',
      title: 'Payment Credited',
      message: `₹${amount} has been credited to your wallet.`,
      type: NotificationType.PAYMENT_CREDITED,
      severity: NotificationSeverity.SUCCESS,
      iconKey: NotificationIconKey.PAYMENT_CREDITED,
      metadata: { bookingId, amount },
    };
  },

  adminCarApproval(
    ownerId: string,
    carId: string,
    carModel: string,
    status: 'APPROVED' | 'REJECTED',
    reason?: string
  ): NotificationPayload {
    return {
      userId: ownerId,
      role: 'OWNER',
      title: status === 'APPROVED' ? 'Car Approved' : 'Car Rejected',
      message:
        status === 'APPROVED'
          ? `Your car ${carModel} has been approved by admin.`
          : `Your car ${carModel} was rejected.${reason ? ` Reason: ${reason}` : ''}`,
      type: NotificationType.CAR_VERIFICATION,
      severity: status === 'APPROVED' ? NotificationSeverity.SUCCESS : NotificationSeverity.ERROR,
      iconKey:
        status === 'APPROVED' ? NotificationIconKey.CAR_APPROVED : NotificationIconKey.CAR_REJECTED,
      metadata: { carId, status, reason },
    };
  },

  /* ========================= ADMIN ========================= */

  newCarForApproval(adminId: string, carId: string, ownerName: string): NotificationPayload {
    return {
      userId: adminId,
      role: 'ADMIN',
      title: 'New Car Awaiting Approval',
      message: `${ownerName} has listed a new car for approval.`,
      type: NotificationType.CAR_APPROVAL_PENDING,
      severity: NotificationSeverity.WARNING,
      iconKey: NotificationIconKey.CAR_APPROVAL_PENDING,
      metadata: { carId },
    };
  },

  newCarOwnerForApproval(adminId: string, ownerId: string, ownerName: string): NotificationPayload {
    return {
      userId: adminId,
      role: 'ADMIN',
      title: 'New Car Owner Awaiting Approval',
      message: `${ownerName} has submitted details for approval.`,
      type: NotificationType.CAR_OWNER_APPROVAL_PENDING,
      severity: NotificationSeverity.INFO,
      iconKey: NotificationIconKey.CAR_OWNER_APPROVAL,
      metadata: { ownerId },
    };
  },

  highPriorityBookingIssue(adminId: string, bookingId: string, issue: string): NotificationPayload {
    return {
      userId: adminId,
      role: 'ADMIN',
      title: 'High Priority Booking Issue',
      message: `An urgent issue was detected for booking #${bookingId}.`,
      type: NotificationType.HIGH_PRIORITY_ISSUE,
      severity: NotificationSeverity.ERROR,
      iconKey: NotificationIconKey.ALERT,
      metadata: { bookingId, issue },
    };
  },

  newDisputeReported(adminId: string, disputeId: string, bookingId: string): NotificationPayload {
    return {
      userId: adminId,
      role: 'ADMIN',
      title: 'New Dispute Reported',
      message: `A dispute has been reported for booking ${bookingId}.`,
      type: NotificationType.DISPUTE_REPORTED,
      severity: NotificationSeverity.ERROR,
      iconKey: NotificationIconKey.DISPUTE_REPORTED,
      metadata: { disputeId, bookingId },
    };
  },
};

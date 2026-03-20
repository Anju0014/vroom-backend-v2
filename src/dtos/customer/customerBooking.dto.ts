export interface CustomerBookingDTO {
  _id: string;
  bookingId: string;

  carId: string;
  userId: string;
  carOwnerId: string;

  carName: string;
  brand: string;
  carNumber: string;
  pickupLocation: string;
  pickupCoordinates: [number, number];

  ownerName: string;
  ownerContact: string;

  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: string;

  receiptUrl?: string;

  refundedAmount?: number;
  cancellationFee?: number;
  cancelledAt?: Date;

  createdAt: Date;
}

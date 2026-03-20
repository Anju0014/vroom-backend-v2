export interface BookingDTO {
  id: string;
  bookingId: string;

  carId: {
    id: string;
    carName: string;
    brand?: string;
  };

  userId: {
    id: string;
    fullName: string;
    email?: string;
  };

  carOwnerId: string;

  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: string;
  isCarReturned?: boolean;

  receiptUrl?: string;

  createdAt: Date;
  updatedAt: Date;
}

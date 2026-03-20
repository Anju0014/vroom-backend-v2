export interface CustomerBookingDTO {
  id: string;
  bookingId?: string;
  carId: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  status: string;
  totalAmount?: number;
  trackingUrl?: string;
  createdAt: Date;
}

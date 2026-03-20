export interface CarOwnerBookingDTO {
  id: string;
  bookingId: string;
  carId: string;
  customerId: string;
  startDate: Date;
  endDate: Date;
  status: string;
  totalPrice: number;
  createdAt?: Date;
}

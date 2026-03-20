export interface CarBookingDTO {
  id: string;
  carId: string;
  customerId: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

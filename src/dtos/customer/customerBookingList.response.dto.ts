import { CustomerBookingDTO } from '@dtos/customer/customerBooking.dto';

export interface CustomerBookingListResponseDTO {
  bookings: CustomerBookingDTO[];
  total: number;
}

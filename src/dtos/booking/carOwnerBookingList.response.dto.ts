import { BookingDTO } from '@dtos/booking/booking.dto';
import { CarOwnerBookingDTO } from '@dtos/booking/carOwnerBooking.dto';

export interface CarOwnerBookingListResponseDTO {
  bookings: CarOwnerBookingDTO[];
  total: number;
}

export interface OwnerBookingListResponseDTO {
  bookings: BookingDTO[];
  total: number;
}

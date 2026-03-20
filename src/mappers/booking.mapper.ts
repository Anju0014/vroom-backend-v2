import { IBooking } from '@models/booking/bookingModel';
import { CarOwnerBookingDTO } from '@dtos/booking/carOwnerBooking.dto';

export class BookingMapper {
  static toCarOwnerBookingDTO(booking: IBooking): CarOwnerBookingDTO {
    return {
      id: booking._id.toString(),
      bookingId: booking.bookingId,
      carId: booking.carId.toString(),
      customerId: booking.userId.toString(),
      startDate: booking.startDate,
      endDate: booking.endDate,
      status: booking.status,
      totalPrice: booking.totalPrice,
      createdAt: booking.createdAt,
    };
  }

  static toCarOwnerBookingDTOList(bookings: IBooking[]): CarOwnerBookingDTO[] {
    return bookings.map(this.toCarOwnerBookingDTO);
  }
}

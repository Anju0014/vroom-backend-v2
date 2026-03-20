import { CustomerBookingDTO } from '@dtos/customer/customerBooking.dto';
import { IBooking } from '@models/booking/bookingModel';

export class CustomerBookingMapper {
  static toDTO(booking: any): CustomerBookingDTO {
    return {
      _id: booking._id.toString(),
      bookingId: booking.bookingId,

      carId: booking.carId.toString(),
      userId: booking.userId.toString(),
      carOwnerId: booking.carOwnerId.toString(),

      startDate: booking.startDate,
      endDate: booking.endDate,
      totalPrice: booking.totalPrice,
      status: booking.status,
      createdAt: booking.createdAt,

      carName: booking.carName,
      brand: booking.brand,
      pickupLocation: booking.pickupLocation,
      pickupCoordinates: booking.pickupCoordinates,
      carNumber: booking.carNumber,

      ownerName: booking.ownerName,
      ownerContact: booking.ownerContact,

      receiptUrl: booking.receiptUrl,
    };
  }

  static toDTOList(bookings: IBooking[]): CustomerBookingDTO[] {
    return bookings.map(this.toDTO);
  }
}

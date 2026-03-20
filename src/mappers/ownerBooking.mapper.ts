import { BookingDTO } from '@dtos/booking/booking.dto';
import { IBooking } from '@models/booking/bookingModel';
import { generateViewRecieptPresignedUrl } from '@services/s3Service';

export async function toBookingDTO(booking: any): Promise<BookingDTO> {
  let receiptUrl: string | undefined;

  if (booking.receiptKey) {
    try {
      receiptUrl = await generateViewRecieptPresignedUrl(booking.receiptKey);
    } catch (err) {
      console.error('Failed to generate receipt URL:', err);
    }
  }

  return {
    id: booking._id.toString(),
    bookingId: booking.bookingId,

    carId: {
      id: booking.carId._id.toString(),
      carName: booking.carId.carName,
      brand: booking.carId.brand,
    },

    userId: {
      id: booking.userId._id.toString(),
      fullName: booking.userId.fullName,
      email: booking.userId.email,
    },

    carOwnerId: booking.carOwnerId.toString(),

    startDate: booking.startDate,
    endDate: booking.endDate,
    totalPrice: booking.totalPrice,
    status: booking.status,

    receiptUrl,

    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt,
    isCarReturned: booking.isCarReturned,
  };
}

export async function toBookingDTOs(bookings: IBooking[]): Promise<BookingDTO[]> {
  return Promise.all(bookings.map((b) => toBookingDTO(b)));
}

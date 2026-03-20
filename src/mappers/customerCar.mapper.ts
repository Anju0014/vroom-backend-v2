import { ICar } from '@models/car/carModel';
import { IBooking } from '@models/booking/bookingModel';
import { CustomerCarDTO } from '@dtos/customer/customerCar.dto';
import { CustomerCarDetailDTO } from '@dtos/customer/customerCarDetail.dto';
import { BookedDateRangeDTO } from '@dtos/booking/bookedDateRange.dto';
import { CustomerBookingDTO } from '@dtos/booking/customerBooking.dto';

export class CustomerCarMapper {
  static toCarDTO(car: ICar): CustomerCarDTO {
    return {
      id: car._id.toString(),
      carName: car.carName,
      brand: car.brand,
      year: Number(car.year),
      fuelType: car.fuelType || '',
      carType: car.carType || '',
      rcBookNo: car.rcBookNo || '',
      expectedWage: car.expectedWage,
      verifyStatus: car.verifyStatus,
      isDeleted: car.isDeleted,
      available: car.available,
      location: {
        address: car.location.address,
        landmark: car.location.landmark,
        coordinates: car.location.coordinates.coordinates as [number, number],
      },
      images: car.images ?? [],
    };
  }

  static toCarDTOs(cars: ICar[]): CustomerCarDTO[] {
    return cars.map(this.toCarDTO);
  }

  static toCarDetailDTO(car: ICar): CustomerCarDetailDTO {
    return {
      ...this.toCarDTO(car),
      videos: car.videos ?? [],
      rcBookProof: car.rcBookProof,
      insuranceProof: car.insuranceProof,
      ownerId: car.owner.toString(),
      createdAt: car.createdAt,
    };
  }

  static toBookedDateRangeDTO(ranges: { start: Date; end: Date }[]): BookedDateRangeDTO[] {
    return ranges.map((r) => ({
      start: r.start,
      end: r.end,
    }));
  }

  static toBookingDTO(booking: IBooking): CustomerBookingDTO {
    return {
      id: booking._id.toString(),
      bookingId: booking.bookingId,
      carId: booking.carId.toString(),
      userId: booking.userId.toString(),
      startDate: booking.startDate,
      endDate: booking.endDate,
      status: booking.status,
      totalAmount: booking.totalPrice,
      trackingUrl: booking.trackingUrl,
      createdAt: booking.createdAt,
    };
  }
}

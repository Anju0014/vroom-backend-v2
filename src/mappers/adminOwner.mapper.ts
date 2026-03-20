import { ICarOwner } from '@models/carowner/carOwnerModel';
import { ICar } from '@models/car/carModel';
import { IBooking } from '@models/booking/bookingModel';
import { OwnerVerifyListItemDTO } from '@dtos/adminOwner/carOwnerVerifyList.response.dto';
import { CarVerifyDTO, CarVerifyListItemDTO } from '@dtos/adminOwner/carVerifyList.response.dto';
import {
  BookingListDetailItemDTO,
  BookingListItemDTO,
} from '@dtos/adminOwner/bookingList.response.dto';
import { ICarPopulated } from '@models/car/carTypesModel';

export class AdminOwnerMapper {
  static toOwnerVerifyDTO(owner: ICarOwner): OwnerVerifyListItemDTO {
    return {
      id: owner._id.toString(),
      fullName: owner.fullName,
      email: owner.email,
      phoneNumber: owner.phoneNumber,
      verifyStatus: owner.verifyStatus,
      blockStatus: owner.blockStatus,
      idVerified: owner.idVerified,
      rejectionReason: owner.rejectionReason,
      createdAt: owner.createdAt,
    };
  }

  static toCarVerifyDTO(car: ICar): CarVerifyListItemDTO {
    return {
      id: car._id.toString(),
      carName: car.carName,
      ownerId: car.owner.toString(),
      verifyStatus: car.verifyStatus,
      blockStatus: car.blockStatus,
      rejectionReason: car.rejectionReason,
      createdAt: car.createdAt,
    };
  }

  static toBookingDTO(booking: IBooking): BookingListItemDTO {
    return {
      id: booking._id.toString(),
      bookingId: booking.bookingId,
      customerId: booking.userId.toString(), // <- correct field
      carId: booking.carId.toString(),
      startDate: booking.startDate,
      endDate: booking.endDate,
      status: booking.status,
      createdAt: booking.createdAt,
      totalPrice: booking.totalPrice,
    };
  }

  static toBookingListDTO(booking: any): BookingListDetailItemDTO {
    return {
      id: booking._id.toString(),
      bookingId: booking.bookingId,

      startDate: booking.startDate,
      endDate: booking.endDate,
      status: booking.status,
      totalPrice: booking.totalPrice,
      createdAt: booking.createdAt,

      customer: {
        id: booking.customer._id.toString(),
        fullName: booking.customer.fullName,
        email: booking.customer.email,
      },

      carOwner: {
        id: booking.carOwner._id.toString(),
        fullName: booking.carOwner.fullName,
        email: booking.carOwner.email,
      },

      car: {
        id: booking.car._id.toString(),
        carName: booking.car.carName,
        model: booking.car.model,
        brand: booking.car.brand,
      },
    };
  }

  static toCarVerifyDetailDTO(car: ICarPopulated): CarVerifyDTO {
    return {
      id: car._id.toString(),
      carName: car.carName,
      brand: car.brand,
      year: car.year,
      fuelType: car.fuelType,
      carType: car.carType,
      expectedWage: car.expectedWage,

      rcBookNo: car.rcBookNo,
      rcBookProof: car.rcBookProof,
      insuranceProof: car.insuranceProof,

      images: car.images,
      videos: car.videos,

      owner: {
        id: car.owner._id.toString(),
        fullName: car.owner.fullName,
        email: car.owner.email,
        phoneNumber: car.owner.phoneNumber,
      },

      verifyStatus: car.verifyStatus,
      blockStatus: car.blockStatus,
      available: car.available,
      unavailableDates: car.unavailableDates,
      location: {
        address: car.location.address,
        landmark: car.location.landmark,
        coordinates: {
          type: 'Point',
          coordinates: car.location.coordinates.coordinates,
        },
      },
      createdAt: car.createdAt,
      updatedAt: car.updatedAt,
    };
  }
}

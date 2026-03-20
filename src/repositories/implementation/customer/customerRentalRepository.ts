import ICustomerRentalRepository from '@repositories/interfaces/customer/ICustomerRentalRepository';
import { BaseRepository } from '@repositories/base/BaseRepository';
import { HydratedDocument } from 'mongoose';
import { Car, ICar } from '@models/car/carModel';
import { Booking, IBooking } from '@models/booking/bookingModel';
import { Counter } from '@models/counter/counterModel';
import { BookingData } from '@app-types/bookingData';

class CustomerRentalRepository extends BaseRepository<ICar> implements ICustomerRentalRepository {
  constructor() {
    super(Car);
  }

  async findNearbyCars(lat: number, lng: number, maxDistance: number): Promise<ICar[]> {
    return Car.find({
      verifyStatus: 1,
      isDeleted: false,
      available: true,
      'location.coordinates': {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          $maxDistance: maxDistance * 1000, // km to meters
        },
      },
    });
  }

  async findFeaturedCars(): Promise<ICar[]> {
    return Car.find({
      verifyStatus: 1,
      isDeleted: false,
      available: true,
    });
  }

  async getAllCars(
    page: number,
    limit: number,
    filters: {
      search?: string;
      minPrice?: number;
      maxPrice?: number;
      carType?: string;
      location?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<ICar[]> {
    const query: any = { isDeleted: false, verifyStatus: 1 };

    if (filters.search) {
      query.carName = { $regex: filters.search, $options: 'i' };
    }

    if (filters.minPrice) {
      query.expectedWage = { ...query.expectedWage, $gte: filters.minPrice };
    }

    if (filters.maxPrice !== Infinity) {
      query.expectedWage = { ...query.expectedWage, $lte: filters.maxPrice };
    }

    if (filters.carType) {
      query.carType = filters.carType;
    }

    if (filters.location) {
      query.$or = [
        { 'location.address': { $regex: filters.location, $options: 'i' } },
        { 'location.landmark': { $regex: filters.location, $options: 'i' } },
      ];
    }

    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);

      const overlappingBookings = await Booking.find({
        status: { $in: ['confirmed', 'pending'] },
        startDate: { $lt: end },
        endDate: { $gt: start },
      }).select('carId');

      const bookedCarIds = overlappingBookings.map((b) => b.carId);

      if (bookedCarIds.length > 0) {
        query._id = { $nin: bookedCarIds };
      }
    }

    const cars = await Car.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return cars;
  }

  async getCarsCount(filters: {
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    carType?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<number> {
    const query: any = { isDeleted: false, verifyStatus: 1 };

    if (filters.search) query.carName = { $regex: filters.search, $options: 'i' };
    if (filters.minPrice) query.expectedWage = { ...query.expectedWage, $gte: filters.minPrice };
    if (filters.maxPrice !== Infinity)
      query.expectedWage = { ...query.expectedWage, $lte: filters.maxPrice };
    if (filters.carType) query.carType = filters.carType;
    if (filters.location) {
      query.$or = [
        { 'location.address': { $regex: filters.location, $options: 'i' } },
        { 'location.landmark': { $regex: filters.location, $options: 'i' } },
      ];
    }

    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);

      const overlappingBookings = await Booking.find({
        status: { $in: ['confirmed', 'pending'] },
        startDate: { $lt: end },
        endDate: { $gt: start },
      }).select('carId');

      const bookedCarIds = overlappingBookings.map((b) => b.carId);
      if (bookedCarIds.length > 0) query._id = { $nin: bookedCarIds };
    }

    return Car.countDocuments(query).exec();
  }

  async findCarById(carId: string): Promise<ICar | null> {
    return Car.findById(carId);
  }

  async findBookedDates(carId: string): Promise<{ start: Date; end: Date }[]> {
    const bookings = await Booking.find({ carId, status: 'confirmed' }, 'startDate endDate');
    return bookings.map((b) => ({ start: b.startDate, end: b.endDate }));
  }

  async createBooking(data: BookingData): Promise<IBooking> {
    return Booking.create(data);
  }

  async findBookingById(bookingId: string): Promise<IBooking | null> {
    return Booking.findById(bookingId);
  }

  async saveBooking(bookingData: HydratedDocument<IBooking>): Promise<IBooking> {
    return bookingData.save();
  }

  async deleteBooking(bookingId: string): Promise<void> {
    await Booking.deleteOne({ _id: bookingId });
  }

  async findConflictingBooking(
    carId: string,
    startDate: Date,
    endDate: Date
  ): Promise<IBooking | null> {
    const now = new Date();

    return Booking.findOne({
      carId,
      $and: [
        {
          $or: [{ status: 'confirmed' }, { status: 'pending', lockedUntil: { $gt: now } }],
        },
        {
          $or: [
            { startDate: { $lte: endDate, $gte: startDate } },
            { endDate: { $lte: endDate, $gte: startDate } },
            { startDate: { $lte: startDate }, endDate: { $gte: endDate } },
          ],
        },
      ],
    });
  }

  async checkOldBooking(bookingData: Partial<BookingData>): Promise<IBooking | null> {
    return Booking.findOne({
      carId: bookingData.carId,
      userId: bookingData.userId,
      startDate: bookingData.startDate,
      endDate: bookingData.endDate,
      status: 'pending',
    });
  }
  async generateBookingId(): Promise<string> {
    const counter = await Counter.findOneAndUpdate(
      { id: 'bookingId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const paddedSeq = counter.seq.toString().padStart(4, '0');
    return `VROOM-RIDE-${paddedSeq}`;
  }

  async updateBookingLocation(bookingId: string, location: { lat: number; lng: number }) {
    return Booking.findByIdAndUpdate(
      bookingId,
      { $set: { currentLocation: location } },
      { new: true }
    );
  }
}

export default CustomerRentalRepository;

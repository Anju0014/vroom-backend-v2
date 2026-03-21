import ICustomerRentalRepository from '@repositories/interfaces/customer/ICustomerRentalRepository';
import { ICustomerRentalService } from '@services/interfaces/customer/ICustomerRentalServices';
import { Car, ICar } from '@models/car/carModel';
import { BookingData, UpdateTrackingProps } from 'types/bookingData';
import generateTrackingToken from '@utils/trackingIDGenerator';
import { getIO } from '@sockets/socket';
import { endOfDay } from 'date-fns';

import { IBooking } from '@models/booking/bookingModel';
import { NotificationTemplates } from '@templates/notificationTemplates';
import { INotificationService } from '@services/interfaces/notification/INotificationServices';
import logger from '@utils/logger';
import { StatusCode } from '@constants/statusCode';
import { ApiError } from '@utils/apiError';

class CustomerRentalService implements ICustomerRentalService {
  private _customerRentalRepository: ICustomerRentalRepository;
  private _notificationService: INotificationService;

  constructor(
    customerRentalRepository: ICustomerRentalRepository,
    notificationService: INotificationService
  ) {
    this._customerRentalRepository = customerRentalRepository;
    this._notificationService = notificationService;
  }

  async getNearbyCars(lat: number, lng: number, maxDistance: number): Promise<ICar[]> {
    return this._customerRentalRepository.findNearbyCars(lat, lng, maxDistance);
  }

  async getFeaturedCars(): Promise<ICar[]> {
    return this._customerRentalRepository.findFeaturedCars();
  }

  async getCarDetail(carId: string): Promise<ICar | null> {
    return this._customerRentalRepository.findCarById(carId);
  }

  async getBookedDateRanges(carId: string): Promise<{ start: Date; end: Date }[]> {
    return this._customerRentalRepository.findBookedDates(carId);
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
      startDate: string;
      endDate: string;
    }
  ): Promise<ICar[]> {
    return this._customerRentalRepository.getAllCars(page, limit, filters);
  }

  async getCarsCount(filters: {
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    carType?: string;
    location?: string;
    startDate: string;
    endDate: string;
  }): Promise<number> {
    return this._customerRentalRepository.getCarsCount(filters);
  }

  async createPendingBooking(bookingData: BookingData): Promise<string> {
    const { carId, startDate, endDate, userId } = bookingData;

    if (!startDate || !endDate) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Start date and end date are required');
    }

    const car = await this._customerRentalRepository.findCarById(carId);
    if (!car) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Car not found');
    }

    const start = new Date(startDate);
    const end = endOfDay(new Date(endDate));

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Invalid date format');
    }

    const conflict = await this._customerRentalRepository.findConflictingBooking(carId, start, end);
    if (conflict && conflict.userId.toString() !== userId) {
      console.log('conflict');
      throw new ApiError(StatusCode.BAD_REQUEST, 'Car is not available for the selected dates');
    }

    const existingBooking = await this._customerRentalRepository.checkOldBooking({
      carId,
      userId,
      startDate: start,
      endDate: end,
    });

    const now = new Date();
    const lockDuration = 10 * 60 * 1000;
    console.log('existing', existingBooking);
    if (existingBooking && existingBooking.lockedUntil && existingBooking?.lockedUntil > now) {
      console.log('existing');
      existingBooking.lockedUntil = new Date(now.getTime() + lockDuration);
      await existingBooking.save();
      if (!existingBooking._id) {
        console.log('erro in existing');
        throw new ApiError(StatusCode.BAD_REQUEST, ' Error in retreiving the old Booking');
      }
      return existingBooking._id.toString();
    }

    const booking = await this._customerRentalRepository.createBooking({
      ...bookingData,
      startDate: start,
      endDate: end,
      status: 'pending',
      lockedUntil: new Date(now.getTime() + lockDuration),
    });

    console.log('booking.-id', booking._id);
    console.log('booking', booking);
    if (!booking || !booking._id) {
      console.log('checking booking error');
      throw new ApiError(StatusCode.BAD_REQUEST, 'Error creating the booking');
    }
    return booking._id.toString();
  }

  async confirmBooking(
    bookingId: string,
    transactionId: string,
    paymentMethod: 'wallet' | 'stripe'
  ): Promise<IBooking> {
    const booking = await this._customerRentalRepository.findBookingById(bookingId);
    if (!booking || booking.status !== 'agreementAccepted') {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Invalid or non-pending booking');
    }

    booking.status = 'confirmed';
    booking.paymentMethod = paymentMethod;
    booking.transactionId = transactionId;

    if (!booking.bookingId) {
      booking.bookingId = await this._customerRentalRepository.generateBookingId();
    }
    await this._customerRentalRepository.saveBooking(booking);
    const token = generateTrackingToken();
    const frontendUrl = process.env.FRONTEND_URL;
    const trackingUrl = `${frontendUrl}/customer/tracking/${bookingId}?token=${token}`;
    booking.trackingToken = token;
    booking.trackingUrl = trackingUrl;

    const updatedBooking = await this._customerRentalRepository.saveBooking(booking);
    const car = await Car.findById(booking.carId);
    const carModel = car?.carName ?? 'Car';

    await this._notificationService.create(
      NotificationTemplates.bookingConfirmed(
        booking.carOwnerId.toString(),
        bookingId,
        carModel,
        booking.startDate,
        booking.endDate
      )
    );

    return updatedBooking;
  }

  async failedBooking(bookingId: string): Promise<void> {
    const booking = await this._customerRentalRepository.findBookingById(bookingId);
    if (!booking || booking.status !== 'pending') {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Invalid or non-pending booking');
    }

    booking.status = 'failed';
    await this._customerRentalRepository.saveBooking(booking);
  }

  async updateTrackingLocation({ bookingId, token, lat, lng }: UpdateTrackingProps): Promise<void> {
    logger.info('Updating location for booking:', bookingId, { lat, lng });
    const booking = await this._customerRentalRepository.findBookingById(bookingId);
    logger.info('Booking found:', booking);

    if (!booking || booking.trackingToken !== token) {
      logger.error('Unauthorized tracking link for booking:', bookingId);
      throw new ApiError(StatusCode.BAD_REQUEST, 'Unauthorized tracking link');
    }

    await this._customerRentalRepository.updateBookingLocation(bookingId, { lat, lng });
    logger.info('Location updated in DB for booking:', bookingId);

    const io = getIO();
    logger.info(`Emitting location to booking_${bookingId}:`, { lat, lng });
    io.to(`booking_${bookingId}`).emit('location:update', { lat, lng });
  }
}
export default CustomerRentalService;

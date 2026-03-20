import { IBooking } from '@models/booking/bookingModel';
import { ICar } from '@models/car/carModel';
import { BookingData } from '@app-types/bookingData';

export interface ICustomerRentalService {
  getNearbyCars(lat: number, lng: number, maxDistance: number): Promise<ICar[]>;
  getFeaturedCars(): Promise<ICar[]>;
  getCarDetail(carId: string): Promise<ICar | null>;
  getBookedDateRanges(carId: string): Promise<{ start: Date; end: Date }[]>;

  createPendingBooking(bookingdata: BookingData): Promise<string>;
  confirmBooking(
    bookingId: string,
    transactionId: string,
    paymentMethod: 'wallet' | 'stripe'
  ): Promise<IBooking>;

  failedBooking(bookingId: string): Promise<void>;

  getCarsCount(filters: {
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    carType?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    startDate: string;
    endDate: string;
  }): Promise<number>;
  getAllCars(
    page: number,
    limit: number,
    filters: {
      search?: string;
      minPrice?: number;
      maxPrice?: number;
      carType?: string;
      location?: string;
      latitude?: number;
      longitude?: number;
      startDate: string;
      endDate: string;
    }
  ): Promise<ICar[]>;

  updateTrackingLocation(updateTrackingProps: {
    bookingId: string;
    token: string;
    lat: number;
    lng: number;
  }): Promise<void>;
}

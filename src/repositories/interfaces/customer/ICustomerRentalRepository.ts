import { ICar } from '@models/car/carModel';
import { IBooking } from '@models/booking/bookingModel';
import { BookingData } from '@app-types/bookingData';

interface ICustomerRentalRepository {
  findNearbyCars(lat: number, lng: number, maxDistance: number): Promise<ICar[]>;
  findFeaturedCars(): Promise<ICar[]>;
  findCarById(carId: string): Promise<ICar | null>;
  findBookedDates(carId: string): Promise<{ start: Date; end: Date }[]>;
  createBooking(bookingData: BookingData): Promise<IBooking>;
  findBookingById(bookingId: string): Promise<IBooking | null>;
  saveBooking(bookingData: IBooking): Promise<IBooking>;
  deleteBooking(bookingId: string): Promise<void>;
  findConflictingBooking(carId: string, startDate: Date, endDate: Date): Promise<IBooking | null>;
  checkOldBooking(bookingData: Partial<BookingData>): Promise<IBooking | null>;
  generateBookingId(): Promise<string>;
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
  updateBookingLocation(bookingId: string, location: { lat: number; lng: number }): Promise<void>;
}

export default ICustomerRentalRepository;

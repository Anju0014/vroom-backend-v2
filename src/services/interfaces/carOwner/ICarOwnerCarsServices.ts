import { ICar } from '@models/car/carModel';
import { IBooking } from '@models/booking/bookingModel';

export interface ICarOwnerCarsService {
  registerNewCar(carDetails: Partial<ICar>, ownerId: string): Promise<ICar>;
  getCarsByOwner(ownerId: string, page: number, limit: number): Promise<ICar[]>;
  getCarsCount(ownerId: string): Promise<number>;
  deleteCar(carId: string): Promise<ICar>;
  updateCar(carId: string, updatedData: Partial<ICar>): Promise<ICar>;

  updateCarAvailability(carId: string, ownerId: string, unavailableDates: string[]): Promise<ICar>;
  getBookingsByCarId(carId: string, ownerId: string): Promise<IBooking[]>;
  getActiveBookingForCar(carId: string): Promise<IBooking | null>;
}

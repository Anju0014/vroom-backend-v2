import { ICar } from '@models/car/carModel';
import { IBooking } from '@models/booking/bookingModel';
import { CarBookingDTO } from '@dtos/car/carBooking.dto';
import { CarDTO } from '@dtos/car/car.dto';

export interface ICarOwnerCarsService {
  registerNewCar(carDetails: Partial<ICar>, ownerId: string): Promise<CarDTO>;
  getCarsByOwner(ownerId: string, page: number, limit: number): Promise<CarDTO[]>;
  getCarsCount(ownerId: string): Promise<number>;
  deleteCar(carId: string): Promise<CarDTO>;
  updateCar(carId: string, updatedData: Partial<ICar>): Promise<CarDTO>;

  updateCarAvailability(
    carId: string,
    ownerId: string,
    unavailableDates: string[]
  ): Promise<CarDTO>;
  getBookingsByCarId(carId: string, ownerId: string): Promise<IBooking[]>;
  getActiveBookingForCar(carId: string): Promise<CarBookingDTO | null>;
}

import { ICar } from '@models/car/carModel';
import { IBooking } from '@models/booking/bookingModel';

interface ICarRepository {
  createCar(car: Partial<ICar>): Promise<ICar>;
  getCarsByOwner(ownerId: string, page: number, limit: number): Promise<ICar[]>;
  getCarsCount(ownerId: string): Promise<number>;
  findCarById(carId: string): Promise<ICar | null>;
  deleteCarById(carId: string): Promise<ICar | null>;
  updateCarById(carId: string, updatedData: Partial<ICar>): Promise<ICar | null>;
  updateAvailability(
    carId: string,
    ownerId: string,
    unavailableDates: string[]
  ): Promise<ICar | null>;
  findByCarId(carId: string, ownerId: string): Promise<IBooking[]>;
  findActiveBookingByCarId(carId: string): Promise<IBooking | null>;
}

export default ICarRepository;

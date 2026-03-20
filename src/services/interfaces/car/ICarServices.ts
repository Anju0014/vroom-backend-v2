import { ICar } from '@models/car/carModel';

export interface ICarService {
  registerNewCar(carDetails: Partial<ICar>, ownerId: string): Promise<ICar>;
  getCarsByOwner(ownerId: string): Promise<ICar[]>;
  deleteCar(carId: string): Promise<ICar>;
  updateCar(carId: string, updatedData: Partial<ICar>): Promise<ICar>;
}

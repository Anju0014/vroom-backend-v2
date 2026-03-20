import { ICar } from '@models/car/carModel';

interface ICarRepository {
  createCar(car: Partial<ICar>): Promise<ICar>;
  getCarsByOwner(ownerId: string): Promise<ICar[]>;
  findCarById(carId: string): Promise<ICar | null>;
  deleteCarById(carId: string): Promise<ICar | null>;
  updateCarById(carId: string, updatedData: Partial<ICar>): Promise<ICar | null>;
}

export default ICarRepository;

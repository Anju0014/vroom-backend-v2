import ICarRepository from '@repositories/interfaces/car/ICarRepository';
import { BaseRepository } from '@repositories/base/BaseRepository';
import { Car, ICar } from '@models/car/carModel';

class CarRepository extends BaseRepository<ICar> implements ICarRepository {
  constructor() {
    super(Car);
  }

  async createCar(car: Partial<ICar>): Promise<ICar> {
    return await Car.create(car);
  }
  async getCarsByOwner(ownerId: string): Promise<ICar[]> {
    return await Car.find({ owner: ownerId, isDeleted: false });
  }

  async deleteCarById(carId: string): Promise<ICar | null> {
    return await Car.findByIdAndUpdate(carId, { isDeleted: true }, { new: true });
  }

  async updateCarById(carId: string, updatedData: Partial<ICar>): Promise<ICar | null> {
    return await Car.findByIdAndUpdate(carId, updatedData, { new: true });
  }

  async findCarById(carId: string): Promise<ICar | null> {
    return await Car.findOne({ _id: carId });
  }
}
export default CarRepository;

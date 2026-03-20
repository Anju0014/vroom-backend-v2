import ICarRepository from '@repositories/interfaces/car/ICarRepository';
import { ICarService } from '@services/interfaces/car/ICarServices';
import { ICar } from '@models/car/carModel';
import mongoose from 'mongoose';
import { StatusCode } from '@constants/statusCode';
import { ApiError } from '@utils/apiError';

class CarService implements ICarService {
  private _carRepository: ICarRepository;

  constructor(carRepository: ICarRepository) {
    this._carRepository = carRepository;
  }

  async registerNewCar(carDetails: Partial<ICar>, ownerId: string): Promise<ICar> {
    if (!ownerId) throw new ApiError(StatusCode.BAD_REQUEST, 'Owner ID is required');

    const carData: Partial<ICar> = {
      ...carDetails,
      owner: new mongoose.Types.ObjectId(ownerId), // Ensure ObjectId is used
      images: carDetails.images && Array.isArray(carDetails.images) ? carDetails.images : [],
      videos: carDetails.videos && Array.isArray(carDetails.videos) ? carDetails.videos : [],
    };

    return await this._carRepository.createCar(carData);
  }
  async getCarsByOwner(ownerId: string): Promise<ICar[]> {
    return await this._carRepository.getCarsByOwner(ownerId);
  }

  async deleteCar(carId: string): Promise<ICar> {
    const deletedCar = await this._carRepository.deleteCarById(carId);
    if (!deletedCar) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Car not found or already deleted');
    }
    return deletedCar;
  }

  async updateCar(carId: string, updatedData: Partial<ICar>): Promise<ICar> {
    const existingCar = await this._carRepository.findCarById(carId);
    if (!existingCar || existingCar.isDeleted) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Car not found or has been deleted.');
    }

    const updatedCar = await this._carRepository.updateCarById(carId, updatedData);
    if (!updatedCar) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Failed to update the car.');
    }

    return updatedCar;
  }
}
export default CarService;

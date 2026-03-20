import { CarOwnerCarDTO } from '@dtos/car/carOwnerCar.dto';

export interface CarOwnerCarListResponseDTO {
  cars: CarOwnerCarDTO[];
  total: number;
}

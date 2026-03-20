import { CarDTO } from '@dtos/car/car.dto';

export interface CarListResponseDTO {
  cars: CarDTO[];
  total: number;
}

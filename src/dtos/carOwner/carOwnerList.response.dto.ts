import { CarOwnerDTO } from '@dtos/carOwner/carOwner.dto';

export interface CarOwnerListResponseDTO {
  carOwners: CarOwnerDTO[];
  total: number;
}

import { CustomerCarDTO } from '@dtos/customer/customerCar.dto';

export interface CustomerCarDetailDTO extends CustomerCarDTO {
  videos: string[];
  rcBookProof?: string;
  insuranceProof?: string;
  ownerId: string;
  createdAt: Date;
}

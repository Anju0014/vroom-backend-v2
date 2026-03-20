import { CustomerDTO } from '@dtos/customer/customer.dto';

export interface CustomerListResponseDTO {
  customers: CustomerDTO[];
  total: number;
}

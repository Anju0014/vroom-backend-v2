import { IAdmin } from '@models/admin/adminModel';

import { ICarOwner } from '@models/carowner/carOwnerModel';
import { ICustomer } from '@models/customer/customerModel';

interface IAdminRepository {
  findPrimaryAdmin(): Promise<IAdmin | null>;
  findById(adminId: string): Promise<IAdmin | null>;
  findUserByEmail(email: string): Promise<IAdmin | null>;
  create(user: Partial<IAdmin>): Promise<IAdmin>;
  updatePassword(adminId: string, password: string): Promise<void>;
  updateRefreshToken(carOwnerId: string, refreshToken: string): Promise<void>;
  findUserByRefreshToken(refreshToken: string): Promise<IAdmin | null>;
  clearRefreshToken(carOwnerId: string): Promise<void>;
  getAllCustomers(
    page: number,
    limit: number,
    search: string
  ): Promise<{ customers: ICustomer[]; total: number }>;
  getAllOwners(
    page: number,
    limit: number,
    search: string
  ): Promise<{ carOwners: ICarOwner[]; total: number }>;
  findCustomerById(customerId: string): Promise<ICustomer | null>;
  updateCustomerStatus(
    customerId: string,
    updateData: Partial<ICustomer>
  ): Promise<ICustomer | null>;
}

export default IAdminRepository;

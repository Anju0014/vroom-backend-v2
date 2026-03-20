import { IAdmin } from '@models/admin/adminModel';
import { ICustomer } from '@models/customer/customerModel';
import { ICarOwner } from '@models/carowner/carOwnerModel';
export interface IAdminService {
  loginAdmin(
    email: string,
    password: string
  ): Promise<{ admin: IAdmin | null; accessToken: string; refreshToken: string }>;
  logoutAdmin(refreshToken: string): Promise<void>;
  renewAuthToken(oldRefreshToken: string): Promise<{ accessToken: string; refreshToken: string }>;
  listAllCustomers(
    page: number,
    limit: number,
    search: string
  ): Promise<{ customers: ICustomer[]; total: number }>;
  listAllCarOwners(
    page: number,
    limit: number,
    search: string
  ): Promise<{ carOwners: ICarOwner[]; total: number }>;
  updateCustomerBlockStatus(customerId: string, newStatus: number): Promise<ICustomer | null>;
}

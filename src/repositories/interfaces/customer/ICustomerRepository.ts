import { ICustomer } from '@models/customer/customerModel';

interface ICustomerRepository {
  findUserByEmail(email: string): Promise<ICustomer | null>;
  create(user: Partial<ICustomer>): Promise<ICustomer>;
  updateCustomer(id: string, updatedData: Partial<ICustomer>): Promise<ICustomer>;
  updateRefreshToken(id: string, refreshToken: string): Promise<void>;
  updatePassword(id: string, password: string): Promise<void>;
  clearRefreshToken(id: string): Promise<void>;
  findUserByRefreshToken(refreshToken: string): Promise<ICustomer | null>;
  findById(id: string): Promise<ICustomer | null>;
  getBlockStatusByUserId(userId: string): Promise<number>;
}

export default ICustomerRepository;

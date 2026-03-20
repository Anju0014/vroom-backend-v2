import { Customer, ICustomer } from '@models/customer/customerModel';
import ICustomerRepository from '@repositories/interfaces/customer/ICustomerRepository';
import { BaseRepository } from '@repositories/base/BaseRepository';

class CustomerRepository extends BaseRepository<ICustomer> implements ICustomerRepository {
  constructor() {
    super(Customer);
  }
  async findUserByEmail(email: string): Promise<ICustomer | null> {
    return await Customer.findOne({ email });
  }
  async create(user: Partial<ICustomer>): Promise<ICustomer> {
    return await Customer.create(user);
  }
  async updateCustomer(customerId: string, updatedData: Partial<ICustomer>): Promise<ICustomer> {
    return (await Customer.findByIdAndUpdate(customerId, updatedData, { new: true })) as ICustomer;
  }
  async updateRefreshToken(customerId: string, refreshToken: string): Promise<void> {
    await Customer.findByIdAndUpdate(customerId, { refreshToken });
  }
  async updatePassword(customerId: string, password: string): Promise<void> {
    await Customer.findByIdAndUpdate(customerId, { password });
  }
  async findUserByRefreshToken(refreshToken: string): Promise<ICustomer | null> {
    return await Customer.findOne({ refreshToken });
  }
  async clearRefreshToken(customerId: string): Promise<void> {
    await Customer.updateOne({ _id: customerId }, { $set: { refreshToken: null } });
  }
  async findById(customerId: string): Promise<ICustomer | null> {
    return await Customer.findOne({ _id: customerId });
  }
  async getBlockStatusByUserId(userId: string): Promise<number> {
    const customer = await Customer.findById(userId).select('blockStatus');
    if (!customer) throw new Error('Owner not found');
    return customer.blockStatus;
  }
}
export default CustomerRepository;

import { Admin, IAdmin } from '@models/admin/adminModel';
import IAdminRepository from '@repositories/interfaces/admin/IAdminRepository';
import { BaseRepository } from '@repositories/base/BaseRepository';
import { Customer, ICustomer } from '@models/customer/customerModel';
import { CarOwner, ICarOwner } from '@models/carowner/carOwnerModel';
import { buildSearchQuery } from '@utils/queryUtils';
import logger from '@utils/logger';

class AdminRepository extends BaseRepository<IAdmin> implements IAdminRepository {
  constructor() {
    super(Admin);
  }

  async findPrimaryAdmin(): Promise<IAdmin | null> {
    return Admin.findOne({ email: 'admin@vroom.com' });
  }
  async findUserByEmail(email: string): Promise<IAdmin | null> {
    return await Admin.findOne({ email });
  }
  async create(user: Partial<IAdmin>): Promise<IAdmin> {
    return await Admin.create(user);
  }
  async updatePassword(adminId: string, password: string): Promise<void> {
    await Admin.findByIdAndUpdate(adminId, { password });
  }
  async findUserByRefreshToken(refreshToken: string): Promise<IAdmin | null> {
    const admin = await Admin.findOne({ refreshToken });
    logger.info('admin refreshcheck', admin);
    return admin;
  }

  async updateRefreshToken(adminId: string, refreshToken: string): Promise<void> {
    const admin = await Admin.findByIdAndUpdate(adminId, { refreshToken });
    logger.info(admin);
  }

  async clearRefreshToken(adminId: string): Promise<void> {
    await Admin.updateOne({ _id: adminId }, { $set: { refreshToken: null } });
  }

  async getAllCustomers(
    page: number,
    limit: number,
    search: string
  ): Promise<{ customers: ICustomer[]; total: number }> {
    try {
      const filter = {
        processStatus: 2,
        verifyStatus: 1,
        ...buildSearchQuery(search, ['fullName', 'email', 'phoneNumber']),
      };

      const customers = await Customer.find(filter, '-password -refreshToken')
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await Customer.countDocuments(filter);

      return { customers, total };
    } catch (error) {
      logger.error('Error in getAllCustomers:', error);
      throw new Error('Database query failed');
    }
  }

  async getAllOwners(
    page: number,
    limit: number,
    search: string
  ): Promise<{ carOwners: ICarOwner[]; total: number }> {
    try {
      const filter = {
        processStatus: 2,
        verifyStatus: 1,
        ...buildSearchQuery(search, ['fullName', 'email', 'phoneNumber']),
      };

      const carOwners = await CarOwner.find(filter, '-password -refreshToken')
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await CarOwner.countDocuments(filter);

      return { carOwners, total };
    } catch (error) {
      logger.error('Error in getAllOwners:', error);
      throw new Error('Database query failed');
    }
  }

  async findCustomerById(customerId: string): Promise<ICustomer | null> {
    let response = await Customer.findById(customerId);

    return response;
  }
  async findById(adminId: string): Promise<IAdmin | null> {
    return await Admin.findOne({ _id: adminId });
  }

  async updateCustomerStatus(
    customerId: string,
    updateData: Partial<ICustomer>
  ): Promise<ICustomer | null> {
    return await Customer.findByIdAndUpdate(customerId, updateData, { new: true });
  }
}
export default AdminRepository;

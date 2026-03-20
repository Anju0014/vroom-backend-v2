import IAdminRepository from '@repositories/interfaces/admin/IAdminRepository';
import { IAdminService } from '@services/interfaces/admin/IAdminServices';
import PasswordUtils from '@utils/passwordUtils';
import JwtUtils from '@utils/jwtUtils';
import { ICustomer } from '@models/customer/customerModel';
import logger from '@utils/logger';
import { IAdmin } from '@models/admin/adminModel';
import { ICarOwner } from '@models/carowner/carOwnerModel';
import { ApiError } from '@utils/apiError';
import { StatusCode } from '@constants/statusCode';

class AdminService implements IAdminService {
  private _adminRepository: IAdminRepository;

  constructor(adminRepository: IAdminRepository) {
    this._adminRepository = adminRepository;
  }
  async loginAdmin(
    email: string,
    password: string
  ): Promise<{ accessToken: string; refreshToken: string; admin: IAdmin | null }> {
    logger.info(`checking login things`);
    const admin = await this._adminRepository.findUserByEmail(email);
    logger.info(admin);

    if (!admin) {
      logger.warn('not correct user');
      throw new ApiError(StatusCode.BAD_REQUEST, 'Invalid Credentials');
    }
    const passwordTrue = await PasswordUtils.comparePassword(password, admin.password);
    if (!passwordTrue) {
      logger.warn('not correct password');
      throw new ApiError(StatusCode.BAD_REQUEST, 'Invalid Credentials');
    }
    const adminAccessToken = JwtUtils.generateAccessToken({
      id: admin._id,
      email: admin.email,
      role: 'admin',
    });
    const newRefreshToken = JwtUtils.generateRefreshToken({ id: admin._id, role: 'admin' });

    await this._adminRepository.updateRefreshToken(admin._id.toString(), newRefreshToken);
    const admin2 = await this._adminRepository.findUserByRefreshToken(newRefreshToken);
    logger.info(admin2);
    logger.info(newRefreshToken);

    return { accessToken: adminAccessToken, refreshToken: newRefreshToken, admin };
  }

  async renewAuthToken(
    oldRefreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const decoded = JwtUtils.verifyToken(oldRefreshToken, true);
    logger.info('Decoded refresh token:', decoded);
    if (!decoded || typeof decoded === 'string') {
      logger.warn('Invalid or malformed refresh token');
      throw new ApiError(StatusCode.BAD_REQUEST, 'Invalid refresh token');
    }
    if (decoded.message === 'Token expired') {
      logger.warn('Refresh token has expired');
      throw new ApiError(StatusCode.BAD_REQUEST, 'Refresh token expired');
    }
    if (!decoded.id) {
      logger.warn('No ID in refresh token payload');
      throw new ApiError(StatusCode.BAD_REQUEST, 'Invalid refresh token');
    }

    const admin = await this._adminRepository.findById(decoded.id);
    logger.info('Stored refresh token:', admin?.refreshToken);
    logger.info('Provided refresh token:', oldRefreshToken);

    if (!admin || admin.refreshToken !== oldRefreshToken) {
      logger.warn('Refresh token mismatch or user not found');
      throw new ApiError(StatusCode.BAD_REQUEST, 'Invalid refresh token');
    }

    const adminAccessToken = JwtUtils.generateAccessToken({
      id: admin._id,
      email: admin.email,
      role: 'admin',
    });
    const newRefreshToken = JwtUtils.generateRefreshToken({ id: admin._id, role: 'admin' });

    await this._adminRepository.updateRefreshToken(admin._id.toString(), newRefreshToken);

    return { accessToken: adminAccessToken, refreshToken: newRefreshToken };
  }

  async logoutAdmin(refreshToken: string): Promise<void> {
    logger.info(refreshToken);
    const admin = await this._adminRepository.findUserByRefreshToken(refreshToken);
    logger.info(admin);
    if (!admin) {
      logger.info('no admin error');
      throw new ApiError(StatusCode.BAD_REQUEST, 'User not found');
    }
    await this._adminRepository.clearRefreshToken(admin._id.toString());
  }

  async listAllCustomers(
    page: number,
    limit: number,
    search: string
  ): Promise<{ customers: ICustomer[]; total: number }> {
    try {
      return await this._adminRepository.getAllCustomers(page, limit, search);
    } catch (error) {
      logger.error('Error in listAllCustomers:', error);
      throw new ApiError(StatusCode.BAD_REQUEST, 'Failed to fetch customers');
    }
  }
  async listAllCarOwners(
    page: number,
    limit: number,
    search: string
  ): Promise<{ carOwners: ICarOwner[]; total: number }> {
    try {
      return await this._adminRepository.getAllOwners(page, limit, search);
    } catch (error) {
      logger.error('Error in listAllCustomers:', error);
      throw new ApiError(StatusCode.BAD_REQUEST, 'Failed to fetch customers');
    }
  }

  async updateCustomerBlockStatus(
    customerId: string,
    newStatus: number
  ): Promise<ICustomer | null> {
    {
      logger.info('Processing status update:', customerId, newStatus);
      const customer = await this._adminRepository.findCustomerById(customerId);

      if (!customer) {
        throw new ApiError(StatusCode.BAD_REQUEST, 'User not found');
      }
      let updateData: Partial<ICustomer> = { blockStatus: newStatus };

      const updatedCustomer = await this._adminRepository.updateCustomerStatus(
        customerId,
        updateData
      );

      if (!updatedCustomer) {
        throw new ApiError(StatusCode.BAD_REQUEST, 'Failed to update status');
      }

      return updatedCustomer;
    }
  }
}

export default AdminService;

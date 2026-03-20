import ICustomerRepository from '@repositories/interfaces/customer/ICustomerRepository';
import { ICustomerService } from '@services/interfaces/customer/ICustomerServices';
import { sendEmail, sendResetEmail } from '@utils/emailconfirm';
import { ICustomer } from '@models/customer/customerModel';
import PasswordUtils from '@utils/passwordUtils';
import JwtUtils from '@utils/jwtUtils';
import { otpTemplate } from '@templates/emailTemplates';
import logger from '@utils/logger';
import { ApiError } from '@utils/apiError';
import { StatusCode } from '@constants/statusCode';

class CustomerService implements ICustomerService {
  private _customerRepository: ICustomerRepository;

  constructor(customerRepository: ICustomerRepository) {
    this._customerRepository = customerRepository;
  }

  async registerBasicDetails(
    customerDetails: Partial<ICustomer>
  ): Promise<{ customer: ICustomer }> {
    const { fullName, email, password, phoneNumber } = customerDetails;

    if (!fullName || !email || !password) {
      logger.warn('All fields are requires');
      throw new ApiError(StatusCode.BAD_REQUEST, 'All fields are required');
    }

    const existingUser = await this._customerRepository.findUserByEmail(customerDetails.email!);

    if (existingUser) {
      logger.warn('User already exists. Throwing error...');
      throw new ApiError(StatusCode.BAD_REQUEST, 'User already exists. Throwing error...');
    }

    const hashedPassword = await PasswordUtils.hashPassword(password);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date();
    otpExpires.setMinutes(otpExpires.getMinutes() + 5);

    const customer = await this._customerRepository.create({
      fullName,
      email,
      password: hashedPassword,
      phoneNumber,
      otp,
      otpExpires,
      processStatus: 0,
    });

    const otpContent = otpTemplate(otp);
    await sendEmail({ to: email, ...otpContent });

    logger.info('create new customer: ', customer);

    return { customer };
  }

  async otpVerify(email: string, otp: string): Promise<{ customer: ICustomer }> {
    logger.info(`Verifying OTP for ${email}: ${otp}`);

    const customer = await this._customerRepository.findUserByEmail(email);

    if (!customer) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'User not found');
    }

    logger.info('Fetched customer from DB:', customer);

    if (!customer) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'User not found');
    }

    if (!customer.otp || customer.otp !== otp) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Invalid OTP');
    }

    if (!customer.otpExpires || new Date() > customer.otpExpires) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'OTP has expired');
    }

    customer.processStatus = 2;
    customer.verifyStatus = 1;
    customer.otp = null;
    customer.otpExpires = null;

    await this._customerRepository.updateCustomer(customer._id.toString(), customer);

    logger.info('User OTP verified successfully!');

    return { customer };
  }

  async resendOtp(email: string): Promise<{ message: string }> {
    logger.info(`Resending OTP for email: ${email}`);
    const customer = await this._customerRepository.findUserByEmail(email);
    if (!customer) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'User not found');
    }
    const newOtp = Math.floor(100000 + Math.random() * 90000).toString();
    const otpExpires = new Date();
    otpExpires.setMinutes(otpExpires.getMinutes() + 5);

    customer.otp = newOtp;
    customer.otpExpires = otpExpires;

    await this._customerRepository.updateCustomer(customer._id.toString(), customer);

    const otpContent = otpTemplate(newOtp);
    await sendEmail({ to: customer.email, ...otpContent });

    logger.info('New OTP sent Successfully');
    return { message: 'OTP resend successfully' };
  }

  async loginCustomer(
    email: string,
    password: string
  ): Promise<{ accessToken: string; refreshToken: string; customer: ICustomer | null }> {
    logger.info(`checking login things`);
    const customer = await this._customerRepository.findUserByEmail(email);
    if (!customer) {
      logger.warn('not correct user');
      throw new Error('Invalid Credentials');
    }

    if (customer.blockStatus === 1) {
      throw new Error('This user is blocked by admin');
    }

    if (customer.processStatus === 0) {
      throw new Error('Signup is not completed');
    }

    const passwordTrue = await PasswordUtils.comparePassword(password, customer.password);
    if (!passwordTrue) {
      logger.warn('not correct');
      throw new ApiError(StatusCode.BAD_REQUEST, 'Invalid Credentials');
    }
    const customerAccessToken = JwtUtils.generateAccessToken({
      id: customer._id,
      email: customer.email,
      role: 'customer',
    });
    const newRefreshToken = JwtUtils.generateRefreshToken({ id: customer._id, role: 'customer' });

    await this._customerRepository.updateRefreshToken(customer._id.toString(), newRefreshToken);

    return { accessToken: customerAccessToken, refreshToken: newRefreshToken, customer };
  }

  async renewAuthToken(
    oldRefreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const decoded = JwtUtils.verifyToken(oldRefreshToken, true);

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

    const customer = await this._customerRepository.findById(decoded.id);
    logger.info('Car owner:', customer);
    logger.info('Stored refresh token:', customer?.refreshToken);
    logger.info('Provided refresh token:', oldRefreshToken);

    if (!customer || customer.refreshToken !== oldRefreshToken) {
      logger.warn('Refresh token mismatch');
      throw new ApiError(StatusCode.BAD_REQUEST, 'Invalid refresh token');
    }
    const accessToken = JwtUtils.generateAccessToken({
      id: customer._id,
      email: customer.email,
      role: 'customer',
    });
    const refreshToken = JwtUtils.generateRefreshToken({ id: customer._id, role: 'customer' });
    await this._customerRepository.updateRefreshToken(customer._id.toString(), refreshToken);

    return { accessToken, refreshToken };
  }

  async forgotPassword(email: string): Promise<void> {
    const customer = await this._customerRepository.findUserByEmail(email);
    if (!customer) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'User not found');
    }
    const resetToken = JwtUtils.generateResetToken({ userId: customer._id });
    await sendResetEmail(customer.email, customer.fullName, resetToken, 'customer');
  }
  async resetPassword(
    token: string,
    newPassword: string,
    role: 'customer' | 'carOwner'
  ): Promise<void> {
    const decoded = JwtUtils.verifyResetToken(token);

    if (!decoded || typeof decoded !== 'object' || !decoded.userId) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Invalid or expired token');
    }
    const hashedPassword = await PasswordUtils.hashPassword(newPassword);
    if (role === 'customer') {
      await this._customerRepository.updatePassword(decoded.userId, hashedPassword);
    }
  }

  async changePassword(
    customerId: string,
    passwordDetails: { oldPassword: string; newPassword: string }
  ): Promise<void> {
    const { oldPassword, newPassword } = passwordDetails;

    const customer = await this._customerRepository.findById(customerId);
    if (!customer) {
      logger.warn('User not found');
      throw new ApiError(StatusCode.BAD_REQUEST, 'Customer not found');
    }

    const passwordMatch = await PasswordUtils.comparePassword(oldPassword, customer.password);
    if (!passwordMatch) {
      logger.warn('incorrect oldpassword');
      throw new Error('Old password is incorrect');
    }

    const hashedPassword = await PasswordUtils.hashPassword(newPassword);

    await this._customerRepository.updatePassword(customerId, hashedPassword);
  }

  async logoutCustomer(refreshToken: string): Promise<void> {
    const customer = await this._customerRepository.findUserByRefreshToken(refreshToken);
    if (!customer) {
      logger.warn('error no customer');
      throw new ApiError(StatusCode.BAD_REQUEST, 'User not found');
    }
    await this._customerRepository.clearRefreshToken(customer._id.toString());
  }

  async loginCustomerGoogle(
    fullName: string,
    email: string,
    profileImage: string,
    provider: string
    // role?: string
  ): Promise<{ accessToken: string; refreshToken: string; customer: ICustomer | null }> {
    let customer = await this._customerRepository.findUserByEmail(email);

    logger.info('google login', customer);

    if (customer && customer.blockStatus === 1) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'User is blocked by the Admin .');
    }

    if (!customer) {
      customer = await this._customerRepository.create({
        fullName,
        email,
        profileImage,
        provider,
        processStatus: 2,
        verifyStatus: 1,
        // role: role || "customer", // Default to "customer" if role isn't provided
      });
    }

    const customerAccessToken = JwtUtils.generateAccessToken({
      id: customer._id,
      email: customer.email,
      role: 'customer',
    });
    const refreshToken = JwtUtils.generateRefreshToken({ id: customer._id, role: 'customer' });

    await this._customerRepository.updateRefreshToken(customer._id.toString(), refreshToken);

    return { accessToken: customerAccessToken, refreshToken, customer };
  }

  async getCustomerProfile(customerId: string): Promise<{ customer: ICustomer }> {
    const customer = await this._customerRepository.findById(customerId);
    if (!customer) throw new ApiError(StatusCode.BAD_REQUEST, 'customer not found');
    return { customer };
  }

  async updateCustomerProfile(
    customerId: string,
    updatedData: Partial<ICustomer>
  ): Promise<ICustomer> {
    if (updatedData.phoneNumber && !/^\d{10}$/.test(updatedData.phoneNumber)) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Invalid phone number format. Must be 10 digits.');
    }

    if (updatedData.address) {
      const requiredFields = ['addressLine1', 'city', 'state', 'postalCode', 'country'];
      for (const field of requiredFields) {
        if (!(updatedData.address as any)[field]) {
          throw new ApiError(StatusCode.BAD_REQUEST, `Missing address field: ${field}`);
        }
      }
    }

    const updatedcustomer = await this._customerRepository.updateCustomer(customerId, updatedData);
    if (!updatedcustomer) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Ccustomer not found or update failed.');
    }

    return updatedcustomer;
  }

  async updateCustomerProfileId(
    customerId: string,
    updatedData: Partial<ICustomer>
  ): Promise<ICustomer> {
    logger.info('id', updatedData.idProof);
    updatedData.processStatus = 1;
    const updatedcustomer = await this._customerRepository.updateCustomer(customerId, updatedData);
    logger.info('updatedcustomer', updatedcustomer);
    if (!updatedcustomer) {
      logger.warn(' update error for customer profile');
      throw new ApiError(StatusCode.BAD_REQUEST, 'Car customer not found or update failed.');
    }
    return updatedcustomer;
  }

  async checkBlockStatus(userId: string): Promise<number> {
    return await this._customerRepository.getBlockStatusByUserId(userId);
  }
}
export default CustomerService;

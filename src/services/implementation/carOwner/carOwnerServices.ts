import ICarOwnerRepository from '@repositories/interfaces/carOwner/ICarOwnerRepository';
import { ICarOwnerService } from '@services/interfaces/carOwner/ICarOwnerServices';
import { sendEmail, sendResetEmail } from '@utils/emailconfirm';
import { ICarOwner } from '@models/carowner/carOwnerModel';
import PasswordUtils from '@utils/passwordUtils';
import JwtUtils from '@utils/jwtUtils';

import { otpTemplate } from '@templates/emailTemplates';
import { NotificationTemplates } from '@templates/notificationTemplates';
import IAdminRepository from '@repositories/interfaces/admin/IAdminRepository';
import { INotificationService } from '@services/interfaces/notification/INotificationServices';
import logger from '@utils/logger';
import { ApiError } from '@utils/apiError';
import { StatusCode } from '@constants/statusCode';

class CarOwnerService implements ICarOwnerService {
  private _carOwnerRepository: ICarOwnerRepository;
  private readonly _adminRepository: IAdminRepository;
  private readonly _notificationService: INotificationService;

  constructor(
    carOwnerRepository: ICarOwnerRepository,
    adminRepository: IAdminRepository,
    notificationService: INotificationService
  ) {
    this._carOwnerRepository = carOwnerRepository;
    this._adminRepository = adminRepository;
    this._notificationService = notificationService;
  }

  async registerBasicDetails(
    carOwnerDetails: Partial<ICarOwner>
  ): Promise<{ carOwner: ICarOwner }> {
    const { fullName, email, password, phoneNumber } = carOwnerDetails;
    logger.info(carOwnerDetails);

    if (!fullName || !email || !password) {
      logger.warn('missing fields for registration ');
      throw new ApiError(StatusCode.BAD_REQUEST, 'All fields are required');
    }

    const existingUser = await this._carOwnerRepository.findUserByEmail(carOwnerDetails.email!);

    if (existingUser) {
      logger.warn('User already exists. Throwing error...');
      throw new ApiError(StatusCode.BAD_REQUEST, 'Email already Exist');
    }

    const hashedPassword = await PasswordUtils.hashPassword(password);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date();
    otpExpires.setMinutes(otpExpires.getMinutes() + 5);

    const carOwner = await this._carOwnerRepository.create({
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

    logger.info('create new carOwner: ', carOwner);
    return { carOwner };
  }

  async otpVerify(email: string, otp: string): Promise<{ carOwner: ICarOwner }> {
    logger.info(`Verifying OTP for ${email}: ${otp}`);

    const carOwner = await this._carOwnerRepository.findUserByEmail(email);

    if (!carOwner) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'User not found');
    }

    logger.info('Fetched carOwner from DB:', carOwner);
    if (!carOwner) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'User not found');
    }

    if (!carOwner.otp || carOwner.otp !== otp) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Invalid OTP');
    }

    if (!carOwner.otpExpires || new Date() > carOwner.otpExpires) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'OTP has expired');
    }

    carOwner.processStatus = 1;
    carOwner.otp = null;
    carOwner.otpExpires = null;

    await this._carOwnerRepository.updateCarOwner(carOwner._id.toString(), carOwner);

    logger.info('User OTP verified successfully!');
    return { carOwner };
  }

  async resendOtp(email: string): Promise<{ message: string }> {
    logger.info(`Resending OTP for email: ${email}`);
    const carOwner = await this._carOwnerRepository.findUserByEmail(email);
    if (!carOwner) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'User not found');
    }
    const newOtp = Math.floor(100000 + Math.random() * 90000).toString();
    const otpExpires = new Date();
    otpExpires.setMinutes(otpExpires.getMinutes() + 5);

    carOwner.otp = newOtp;
    carOwner.otpExpires = otpExpires;

    await this._carOwnerRepository.updateCarOwner(carOwner._id.toString(), carOwner);

    const otpContent = otpTemplate(newOtp);
    await sendEmail({ to: carOwner.email, ...otpContent });

    logger.info('New OTP sent Successfully');
    return { message: 'OTP resend successfully' };
  }

  async loginCarOwner(
    email: string,
    password: string
  ): Promise<{ accessToken: string; refreshToken: string; carOwner: ICarOwner | null }> {
    logger.info(`checking login things`);
    const carOwner = await this._carOwnerRepository.findUserByEmail(email);
    logger.info(carOwner);
    if (!carOwner) {
      logger.warn('not correct user- carowner');
      throw new ApiError(StatusCode.BAD_REQUEST, 'Invalid Credentials');
    }

    if (carOwner.processStatus < 1) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Not a  verified User');
    }

    if (carOwner.blockStatus === 1) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'This user is blocked by admin');
    }

    const passwordTrue = await PasswordUtils.comparePassword(password, carOwner.password);
    if (!passwordTrue) {
      logger.warn('not correct password');
      throw new ApiError(StatusCode.BAD_REQUEST, 'Invalid Credentials');
    }
    const ownerAccessToken = JwtUtils.generateAccessToken({
      id: carOwner._id,
      email: carOwner.email,
      role: 'carOwner',
    });
    const newRefreshToken = JwtUtils.generateRefreshToken({ id: carOwner._id, role: 'carOwner' });

    this._carOwnerRepository.updateRefreshToken(carOwner._id.toString(), newRefreshToken);

    return { accessToken: ownerAccessToken, refreshToken: newRefreshToken, carOwner };
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

    const carOwner = await this._carOwnerRepository.findById(decoded.id);
    logger.info('Car owner:', carOwner);
    logger.info('Stored refresh token:', carOwner?.refreshToken);
    logger.info('Provided refresh token:', oldRefreshToken);

    if (!carOwner || carOwner.refreshToken !== oldRefreshToken) {
      logger.warn('Refresh token mismatch or user not found');
      throw new ApiError(StatusCode.BAD_REQUEST, 'Invalid refresh token');
    }

    const accessToken = JwtUtils.generateAccessToken({
      id: carOwner._id,
      email: carOwner.email,
      role: 'carOwner',
    });
    const refreshToken = JwtUtils.generateRefreshToken({ id: carOwner._id, role: 'carOwner' });
    await this._carOwnerRepository.updateRefreshToken(carOwner._id.toString(), refreshToken);

    return { accessToken, refreshToken };
  }

  async completeRegister(ownerId: string, ownerDetails: Partial<ICarOwner>): Promise<ICarOwner> {
    const carOwner = await this._carOwnerRepository.findById(ownerId);
    if (!carOwner) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Owner Not Found');
    }

    if (ownerDetails.phoneNumber && !/^\d{10}$/.test(ownerDetails.phoneNumber)) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Invalid phone number format. Must be 10 digits.');
    }

    if (ownerDetails.address) {
      const requiredFields = ['addressLine1', 'city', 'state', 'postalCode', 'country'];
      for (const field of requiredFields) {
        if (!(ownerDetails.address as any)[field]) {
          throw new ApiError(StatusCode.BAD_REQUEST, `Missing address field: ${field}`);
        }
      }
    }
    ownerDetails.processStatus = 2;
    ownerDetails.verifyStatus = 0;

    const updatedOwner = await this._carOwnerRepository.updateCarOwner(ownerId, ownerDetails);
    if (!updatedOwner) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Car owner not found or update failed.');
    }

    updatedOwner.processStatus = 2;

    const admin = await this._adminRepository.findPrimaryAdmin();
    if (!admin) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Admin not found');
    }

    await this._notificationService.create(
      NotificationTemplates.newCarOwnerForApproval(
        admin._id.toString(),
        ownerId.toString(),
        updatedOwner.fullName
      )
    );

    return updatedOwner;
  }

  async forgotPassword(email: string): Promise<void> {
    const carOwner = await this._carOwnerRepository.findUserByEmail(email);
    if (!carOwner) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'User not found');
    }
    const resetToken = JwtUtils.generateResetToken({ userId: carOwner._id });

    await sendResetEmail(carOwner.email, carOwner.fullName, resetToken, 'carOwner');
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
    if (role === 'carOwner') {
      await this._carOwnerRepository.updatePassword(decoded.userId, hashedPassword);
    }
  }

  async changePassword(
    ownerId: string,
    passwordDetails: { oldPassword: string; newPassword: string }
  ): Promise<{ success: boolean; message: string }> {
    const { oldPassword, newPassword } = passwordDetails;

    const carOwner = await this._carOwnerRepository.findById(ownerId);
    if (!carOwner) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Car Owner not found');
    }

    const passwordMatch = await PasswordUtils.comparePassword(oldPassword, carOwner.password);
    if (!passwordMatch) {
      return { success: false, message: 'Old password is incorrect' };
    }

    const hashedPassword = await PasswordUtils.hashPassword(newPassword);

    await this._carOwnerRepository.updatePassword(ownerId, hashedPassword);

    return { success: true, message: 'Password updated successfully' };
  }

  async logoutCarOwner(refreshToken: string): Promise<void> {
    const carOwner = await this._carOwnerRepository.findUserByRefreshToken(refreshToken);
    if (!carOwner) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'User not found');
    }
    await this._carOwnerRepository.clearRefreshToken(carOwner._id.toString());
  }

  async loginOwnerGoogle(
    fullName: string,
    email: string,
    profileImage: string,
    provider: string
    // role?: string
  ): Promise<{ accessToken: string; refreshToken: string; carOwner: ICarOwner | null }> {
    let carOwner = await this._carOwnerRepository.findUserByEmail(email);

    if (carOwner && carOwner.blockStatus === 1) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'User is blocked by the Admin.');
    }

    if (!carOwner) {
      carOwner = await this._carOwnerRepository.create({
        fullName,
        email,
        // googleId,
        profileImage,
        provider,
        processStatus: 1,
        // role: role || "customer", // Default to "customer" if role isn't provided
      });
    }

    const ownerAccessToken = JwtUtils.generateAccessToken({
      id: carOwner._id,
      email: carOwner.email,
      role: 'carOwner',
    });
    const refreshToken = JwtUtils.generateRefreshToken({ id: carOwner._id, role: 'carOwner' });

    await this._carOwnerRepository.updateRefreshToken(carOwner._id.toString(), refreshToken);
    await this._carOwnerRepository.findUserByEmail(email);
    return { accessToken: ownerAccessToken, refreshToken, carOwner };
  }

  async getOwnerProfile(ownerId: string): Promise<ICarOwner> {
    const carOwner = await this._carOwnerRepository.findById(ownerId);
    if (!carOwner) throw new Error('Owner not found');

    return carOwner;
  }

  async updateCarOwnerProfile(
    carOwnerId: string,
    updatedData: Partial<ICarOwner>
  ): Promise<ICarOwner> {
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

    const updatedOwner = await this._carOwnerRepository.updateCarOwner(carOwnerId, updatedData);
    if (!updatedOwner) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Car owner not found or update failed.');
    }

    return updatedOwner;
  }

  async checkBlockStatus(userId: string): Promise<number> {
    return await this._carOwnerRepository.getBlockStatusByUserId(userId);
  }
}

export default CarOwnerService;

import IAdminOwnerRepository from '@repositories/interfaces/admin/IAdminOwnerRepository';
import { IAdminOwnerService } from '@services/interfaces/admin/IAdminOwnerServices';

import { CarOwner, ICarOwner } from '@models/carowner/carOwnerModel';
import { sendEmail } from '@utils/emailconfirm';
import { ICar } from '@models/car/carModel';

import {
  carVerificationRejectedTemplate,
  verificationApprovedTemplate,
  verificationRejectedTemplate,
} from '@templates/emailTemplates';

import logger from '@utils/logger';
import { IBooking } from '@models/booking/bookingModel';
import { ICarPopulated } from '@models/car/carTypesModel';
import { Stats } from '@app-types/stats';
import { stripe } from '@config/stripeConfig';
import { IWallet } from '@models/wallet/walletModel';
import { StatusCode } from '@constants/statusCode';
import { ApiError } from '@utils/apiError';

class AdminOwnerService implements IAdminOwnerService {
  private _adminOwnerRepository: IAdminOwnerRepository;

  constructor(adminOwnerRepository: IAdminOwnerRepository) {
    this._adminOwnerRepository = adminOwnerRepository;
  }

  async listAllOwnerforVerify(
    page: number,
    limit: number,
    search: string
  ): Promise<{ carOwners: ICarOwner[]; total: number }> {
    try {
      return await this._adminOwnerRepository.getAllOwnerforVerify(page, limit, search);
    } catch (error) {
      logger.error('Error in listAllCustomers:', error);
      throw new ApiError(StatusCode.BAD_REQUEST, 'Failed to fetch customers');
    }
  }

  async listAllCarsforVerify(
    page: number,
    limit: number,
    search: string
  ): Promise<{ cars: ICarPopulated[]; total: number }> {
    try {
      logger.info('reached222');

      return await this._adminOwnerRepository.getAllCarsforVerify(page, limit, search);
    } catch (error) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Failed to fetch cars');
    }
  }

  async listAllVerifiedCars(
    page: number,
    limit: number,
    search: string
  ): Promise<{ cars: ICarPopulated[]; total: number }> {
    try {
      return await this._adminOwnerRepository.getAllCarsforVerify(page, limit, search);
    } catch (error) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Failed to fetch cars');
    }
  }

  async listAllBookings(
    page: number,
    limit: number,
    search: string
  ): Promise<{ bookings: IBooking[]; total: number }> {
    try {
      return await this._adminOwnerRepository.getAllBookings(page, limit, search);
    } catch (error) {
      logger.error('Error in listAllBookings:', error);
      throw new ApiError(StatusCode.BAD_REQUEST, 'Failed to fetch bookings');
    }
  }

  async updateOwnerVerifyStatus(
    ownerId: string,
    verifyDetails: Partial<ICarOwner>
  ): Promise<ICarOwner> {
    const { verifyStatus, rejectionReason } = verifyDetails;
    if (verifyStatus === -1 && !rejectionReason) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Reason is required when rejecting');
    }
    const user = await this._adminOwnerRepository.findCarOwnerById(ownerId);
    logger.warn('poskook user not found');
    if (!user) {
      logger.warn('poskook user not found');
      throw new ApiError(StatusCode.BAD_REQUEST, ' User Not Found');
    }
    let updatedUser = await this._adminOwnerRepository.updateOwnerStatus(ownerId, verifyDetails);
    logger.info('pknns', updatedUser);
    if (!updatedUser) {
      throw new Error('Error in updating the status');
      throw new ApiError(StatusCode.BAD_REQUEST, 'Error in updating the status');
    }
    logger.info('useremail ', updatedUser.email);
    if (verifyStatus === -1) {
      const emailContent = verificationRejectedTemplate(updatedUser.fullName, rejectionReason);
      await sendEmail({ to: updatedUser.email, ...emailContent });
    } else if (verifyStatus === 1) {
      const emailContent = verificationApprovedTemplate(updatedUser.fullName);
      await sendEmail({ to: updatedUser.email, ...emailContent });
    }

    logger.info('message');

    return updatedUser;
  }

  async updateOwnerBlockStatus(ownerId: string, newStatus: number): Promise<ICarOwner> {
    logger.info('Processing status update:', ownerId, newStatus);
    const user = await this._adminOwnerRepository.findCarOwnerById(ownerId);
    if (!user) throw new Error('User not found');

    const updatedOwner = await this._adminOwnerRepository.updateOwnerStatus(ownerId, {
      blockStatus: newStatus,
    });

    if (!updatedOwner) throw new Error('Error updating owner block status');

    return updatedOwner;
  }

  async updateCarBlockStatus(carId: string, newStatus: number): Promise<ICar> {
    logger.info('Processing status update:', carId, newStatus);
    const car = await this._adminOwnerRepository.findCarById(carId);
    if (!car) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Car not found');
    }

    let updateData: Partial<ICar> = { blockStatus: newStatus };
    const updatedCar = await this._adminOwnerRepository.updateCarStatus(carId, updateData);

    if (!updatedCar) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Error updating car block status');
    }

    return updatedCar;
  }

  async updateCarVerifyStatus(carId: string, verifyDetails: Partial<ICar>): Promise<ICar> {
    const { verifyStatus, rejectionReason } = verifyDetails;

    if (verifyStatus === -1 && !rejectionReason) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Reason is required when rejecting');
    }

    const car = await this._adminOwnerRepository.findCarById(carId);
    if (!car) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Car not found');
    }
    if (car.verifyStatus !== 0) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Car has already Verified. Please try Later');
    }
    const updatedCar = await this._adminOwnerRepository.updateCarStatus(carId, verifyDetails);
    if (!updatedCar) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Error updating car status');
    }

    if (verifyStatus === -1) {
      const updatedUser = await this._adminOwnerRepository.findCarOwnerById(
        String(updatedCar.owner)
      );
      if (!updatedUser) {
        throw new ApiError(StatusCode.BAD_REQUEST, 'Car owner not found');
      }

      const emailContent = carVerificationRejectedTemplate(
        updatedUser.fullName,
        updatedCar.carName,
        rejectionReason
      );
      await sendEmail({ to: updatedUser.email, ...emailContent });
    }
    // return AdminOwnerMapper.toCarVerifyDTO(updatedCar);
    return updatedCar;
  }

  async getAdminStats(range: string): Promise<Stats> {
    const today = new Date();
    let startDate = new Date();

    if (range === '7d') startDate.setDate(today.getDate() - 7);
    else if (range === '30d') startDate.setDate(today.getDate() - 30);
    else startDate.setFullYear(today.getFullYear() - 1);
    const [totalCars, totalCustomers, totalCarOwners, totalBookings, activeRentals, totalRevenue] =
      await Promise.all([
        this._adminOwnerRepository.countCars(),
        this._adminOwnerRepository.countCustomers(),
        this._adminOwnerRepository.countOwners(),
        this._adminOwnerRepository.countBookings(),
        this._adminOwnerRepository.countActiveBookings(),
        this._adminOwnerRepository.getTotalPlatformRevenue(),
      ]);
    const earnings = await this._adminOwnerRepository.getEarnings(startDate);

    const carStats = await this._adminOwnerRepository.getCarStats();

    return {
      totalCars,
      totalCustomers,
      totalCarOwners,
      totalBookings,
      activeRentals,
      totalRevenue,
      earnings,
      carStats,
    };
  }
  async getOwnerWallets(): Promise<IWallet[] | null> {
    return this._adminOwnerRepository.getOwnerWallets();
  }

  async payoutOwner(
    ownerId: string,
    amount: number
  ): Promise<{ wallet: IWallet; transferId: string }> {
    const owner = await CarOwner.findById(ownerId);

    if (!owner?.stripeAccountId) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Stripe account not found');
    }

    if (!owner.payoutEnabled) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Payout not enabled for this owner');
    }

    const wallet = await this._adminOwnerRepository.getWalletByOwnerId(ownerId);

    if (!wallet) throw new ApiError(StatusCode.BAD_REQUEST, 'Wallet not found');

    if (wallet.balance < amount) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Insufficient wallet balance');
    }

    const transfer = await stripe.transfers.create({
      amount: amount * 100,
      currency: 'inr',
      destination: owner.stripeAccountId,
    });

    wallet.balance -= amount;
    wallet.totalWithdrawn += amount;

    wallet.transactions.push({
      transactionId: transfer.id,
      type: 'payout',
      amount,
      description: 'Admin payout',
      status: 'completed',
      date: new Date(),
    });

    await this._adminOwnerRepository.savewallet(wallet);

    return {
      wallet,
      transferId: transfer.id,
    };
  }
}

export default AdminOwnerService;

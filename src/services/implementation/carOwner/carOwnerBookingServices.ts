import { ICarOwnerBookingService } from '@services/interfaces/carOwner/ICarOwnerBookingServices';

import ICarOwnerBookingRepository from '@repositories/interfaces/carOwner/ICarOwnerBookingRepository';

import { IBooking } from '@models/booking/bookingModel';
import { Stats } from '@app-types/stats';
import IWalletRepository from '@repositories/interfaces/wallet/IWalletRepository';
import IAdminRepository from '@repositories/interfaces/admin/IAdminRepository';
import { ApiError } from '@utils/apiError';
import { StatusCode } from '@constants/statusCode';

class CarOwnerBookingService implements ICarOwnerBookingService {
  private _ownersBookingRepository: ICarOwnerBookingRepository;
  private _walletRepository: IWalletRepository;
  private _adminRepository: IAdminRepository;

  constructor(
    ownerBookingRepository: ICarOwnerBookingRepository,
    walletRepository: IWalletRepository,
    adminRepository: IAdminRepository
  ) {
    this._ownersBookingRepository = ownerBookingRepository;
    this._walletRepository = walletRepository;
    this._adminRepository = adminRepository;
  }

  async getBookingsForCarOwner(
    carOwnerId: string,
    page: number,
    limit: number,
    search: string,
    status: string
  ): Promise<{ bookings: IBooking[]; total: number }> {
    const { bookings, total } = await this._ownersBookingRepository.getBookingsForCarOwner(
      carOwnerId,
      page,
      limit,
      search,
      status
    );
    return { bookings, total };
  }
  async markCarReceived(bookingId: string): Promise<IBooking> {
    const booking = await this._ownersBookingRepository.markCarReturned(bookingId);

    if (!booking) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Booking not found');
    }

    if (booking.status !== 'confirmed') {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Only confirmed bookings can be completed');
    }

    const totalAmount = booking.totalPrice;
    const platformFeeRate = 0.03;
    const platformFee = Math.round(totalAmount * platformFeeRate);
    const payoutAmount = totalAmount - platformFee;

    let wallet = await this._walletRepository.findWalletByUserId(booking.carOwnerId.toString());

    if (!wallet) {
      wallet = await this._walletRepository.createWallet(booking.carOwnerId.toString(), 'CarOwner');
    }

    if (!wallet) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Failed to create owner wallet');
    }

    wallet.balance += payoutAmount;
    wallet.pendingPayout += payoutAmount;

    wallet.transactions.push({
      transactionId: `credit_${booking.bookingId}_${Date.now()}`,
      type: 'credit',
      amount: payoutAmount,
      bookingId: booking._id,
      description: `Trip earnings for booking ${booking.bookingId}`,
      status: 'completed',
      date: new Date(),
    });

    await this._walletRepository.saveWallet(wallet);

    const admin = await this._adminRepository.findPrimaryAdmin();

    if (!admin) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Admin not found');
    }

    let adminWallet = await this._walletRepository.findWalletByUserId(admin._id.toString());

    if (!adminWallet) {
      adminWallet = await this._walletRepository.createWallet(admin._id.toString(), 'Admin');
    }

    if (!adminWallet) {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Failed to create admin wallet');
    }

    adminWallet.balance += platformFee;

    adminWallet.transactions.push({
      transactionId: `fee_${booking.bookingId}_${Date.now()}`,
      type: 'credit',
      amount: platformFee,
      bookingId: booking._id,
      description: `Platform fee from booking ${booking.bookingId}`,
      status: 'completed',
      date: new Date(),
    });

    await this._walletRepository.saveWallet(adminWallet);
    await booking.save();
    return booking;
  }
  // async markCarReceived(bookingId: string): Promise<IBooking> {
  //   const booking = await this._ownersBookingRepository.markCarReturned(bookingId);

  //   if (!booking) {
  //     throw new Error('Booking not found');
  //   }

  //   if (booking.status !== 'confirmed') {
  //     throw new Error('Only confirmed bookings can be completed');
  //   }

  //   const totalAmount = booking.totalPrice;
  //   const platformFeeRate = 0.03; // 3%
  //   const platformFee = Math.round(totalAmount * platformFeeRate);
  //   const payoutAmount = totalAmount - platformFee;

  //   let wallet = await this._ownersBookingRepository.findWalletByUserId(
  //     booking.carOwnerId.toString()
  //   );

  //   if (!wallet) {
  //     wallet = await this._ownersBookingRepository.createWallet(booking.carOwnerId.toString());
  //   }

  //   if (!wallet) {
  //     throw new Error('Failed to create wallet');
  //   }

  //   wallet.balance += payoutAmount;
  //   wallet.pendingPayout += payoutAmount;
  //   // wallet.transactions.push({
  //   //   transactionId: `payout_${booking.bookingId}_${Date.now()}`,
  //   //   type: 'credit',
  //   //   amount: payoutAmount,
  //   //   description: `Payout for booking ${booking.bookingId}`,
  //   //   date: new Date(),
  //   // });
  //   wallet.transactions.push({
  //     transactionId: `credit_${booking.bookingId}_${Date.now()}`,
  //     type: 'credit',
  //     amount: payoutAmount,
  //     bookingId: booking._id,
  //     description: `Trip earnings for booking ${booking.bookingId}`,
  //     status: 'completed',
  //     date: new Date(),
  //   });

  //   await this._ownersBookingRepository.saveWallet(wallet);
  //   await booking.save();

  //   return booking;
  // }

  async getOwnerStats(carOwnerId: string, range: string): Promise<Stats> {
    const today = new Date();
    let startDate = new Date();

    if (range === '7d') startDate.setDate(today.getDate() - 7);
    else if (range === '30d') startDate.setDate(today.getDate() - 30);
    else startDate.setFullYear(today.getFullYear() - 1);
    const [totalCars, totalBookings, activeRentals] = await Promise.all([
      this._ownersBookingRepository.countCars(carOwnerId),
      this._ownersBookingRepository.countBookings(carOwnerId),
      this._ownersBookingRepository.countActiveBookings(carOwnerId),
    ]);

    const earnings = await this._ownersBookingRepository.getEarnings(carOwnerId, startDate);

    const carStats = await this._ownersBookingRepository.getCarStats(carOwnerId);
    return {
      totalCars,
      totalBookings,
      activeRentals,
      earnings,
      carStats,
    };
  }

  async getOwnerWallet(userId: string, page: number, limit: number) {
    return this._ownersBookingRepository.findWalletByUserWithTransactions(userId, page, limit);
  }
  async getOwnerWalletTransactionCount(userId: string) {
    return this._ownersBookingRepository.getTransactionCount(userId);
  }
  async getPayoutStatus(userId: string) {
    return this._ownersBookingRepository.getPayoutStatus(userId);
  }
}
export default CarOwnerBookingService;

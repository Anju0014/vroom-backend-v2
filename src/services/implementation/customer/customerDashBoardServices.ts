import ICustomerDashBoardRepository from '@repositories/interfaces/customer/ICustomerDashBoardRepository';
import { ICustomerDashBoardService } from '@services/interfaces/customer/ICustomerDashBoardServices';

import { stripe } from '@config/stripeConfig';
import { IBooking } from '@models/booking/bookingModel';
import logger from '@utils/logger';
import IWalletRepository from '@repositories/interfaces/wallet/IWalletRepository';
import IAdminRepository from '@repositories/interfaces/admin/IAdminRepository';
import { ApiError } from '@utils/apiError';
import { StatusCode } from '@constants/statusCode';

class CustomerDashBoardService implements ICustomerDashBoardService {
  private _customerDashRepository: ICustomerDashBoardRepository;
  private _walletRepository: IWalletRepository;
  private _adminRepository: IAdminRepository;

  constructor(
    customerDashRepository: ICustomerDashBoardRepository,
    walletRepository: IWalletRepository,
    adminRepository: IAdminRepository
  ) {
    this._customerDashRepository = customerDashRepository;
    this._walletRepository = walletRepository;
    this._adminRepository = adminRepository;
  }

  async getCustomerBookings(userId: string, page: number, limit: number): Promise<any[]> {
    return this._customerDashRepository.findBookingsByUserId(userId, page, limit);
  }

  async getCustomerBookingCount(userId: string): Promise<number> {
    return this._customerDashRepository.bookingsByUserCount(userId);
  }

  async getCustomerWallet(userId: string, page: number, limit: number) {
    return this._customerDashRepository.findWalletByUserWithTransactions(userId, page, limit);
  }

  async getCustomerWalletTransactionCount(userId: string) {
    return this._customerDashRepository.getTransactionCount(userId);
  }

  async cancelBooking(bookingId: string): Promise<IBooking> {
    const booking = await this._customerDashRepository.findBookingById(bookingId);
    if (!booking || booking.status !== 'confirmed') {
      throw new ApiError(StatusCode.BAD_REQUEST, 'Invalid or non-confirmed booking');
    }

    const totalAmount = booking.totalPrice;
    const cancellationFeeRate = 0.01; // 1%
    const cancellationFee = Math.round(totalAmount * cancellationFeeRate);
    const refundAmount = totalAmount - cancellationFee;

    let wallet = await this._customerDashRepository.findWalletByUserId(booking.userId.toString());

    if (!wallet) {
      wallet = await this._customerDashRepository.createWallet(booking.userId.toString());
      if (!wallet) throw new ApiError(StatusCode.BAD_REQUEST, 'Failed to create wallet');
    }

    if (booking.paymentMethod === 'stripe' && booking.transactionId) {
      try {
        const refund = await stripe.refunds.create({
          payment_intent: booking.transactionId,
          amount: refundAmount * 100, // Stripe uses cents/paise
        });
        logger.info(refund);
      } catch (err) {
        console.error('Stripe refund failed:', err);
        throw new Error('Stripe refund failed. Cancellation aborted.');
      }
    }

    wallet.balance += refundAmount;
    wallet.transactions.push({
      transactionId: `refund_${booking.bookingId}_${Date.now()}_${Math.floor(
        Math.random() * 1000
      )}`,
      type: 'refund',
      amount: refundAmount,
      description: `Refund for booking cancellation - ${booking.bookingId}`,
      date: new Date(),
    });

    await this._customerDashRepository.saveWallet(wallet);

    const admin = await this._adminRepository.findPrimaryAdmin();

    if (!admin) {
      throw new Error('Admin not found');
    }

    let adminWallet = await this._walletRepository.findWalletByUserId(admin._id.toString());

    if (!adminWallet) {
      adminWallet = await this._walletRepository.createWallet(admin._id.toString(), 'Admin');
    }

    if (!adminWallet) {
      throw new Error('Failed to create admin wallet');
    }

    adminWallet.balance += cancellationFee;

    adminWallet.transactions.push({
      transactionId: `fee_${booking.bookingId}_${Date.now()}`,
      type: 'cancellation',
      amount: cancellationFee,
      bookingId: booking._id,
      description: `Cancellation fee from booking ${booking.bookingId}`,
      status: 'completed',
      date: new Date(),
    });

    await this._walletRepository.saveWallet(adminWallet);

    console.log('Wallet updated with refund. New balance:', wallet.balance);

    booking.status = 'cancelled';
    booking.cancellationFee = cancellationFee;
    booking.refundedAmount = refundAmount;
    booking.cancelledAt = new Date();

    const updatedBooking = await this._customerDashRepository.saveBooking(booking);
    console.log('Booking cancelled and saved successfully:', updatedBooking.bookingId);

    return updatedBooking;
  }
}
export default CustomerDashBoardService;

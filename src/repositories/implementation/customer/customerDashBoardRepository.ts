import { Customer, ICustomer } from '@models/customer/customerModel';
import ICustomerDashBoardRepository from '@repositories/interfaces/customer/ICustomerDashBoardRepository';
import { BaseRepository } from '@repositories/base/BaseRepository';
import { Booking, IBooking } from '@models/booking/bookingModel';

import { HydratedDocument, Types } from 'mongoose';
import { Wallet, IWallet } from '@models/wallet/walletModel';
import logger from '@utils/logger';

class CustomerDashBoardRepository
  extends BaseRepository<ICustomer>
  implements ICustomerDashBoardRepository
{
  constructor() {
    super(Customer);
  }

  async findBookingsByUserId(userId: string, page: number, limit: number): Promise<any[]> {
    const bookings = await Booking.find({ userId, status: { $ne: 'pending' } })
      .populate({
        path: 'carId',
        select: 'carName brand location.address location.coordinates.coordinates rcBookNo',
      })
      .populate({
        path: 'carOwnerId',
        select: 'fullName phoneNumber',
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return bookings.map((booking) => ({
      _id: booking._id,
      bookingId: booking.bookingId,
      carId: booking.carId._id,
      userId: booking.userId,
      carOwnerId: booking.carOwnerId._id,
      startDate: booking.startDate,
      endDate: booking.endDate,
      totalPrice: booking.totalPrice,
      status: booking.status,
      createdAt: booking.createdAt,
      carName: booking.carId.carName,
      brand: booking.carId.brand,
      pickupLocation: booking.carId.location.address,
      pickupCoordinates: booking.carId.location.coordinates.coordinates,
      carNumber: booking.carId.rcBookNo,
      ownerName: booking.carOwnerId.fullName,
      ownerContact: booking.carOwnerId.phoneNumber,
      receiptUrl: booking.receiptUrl,
    }));
  }

  async bookingsByUserCount(userId: string): Promise<number> {
    const count = await Booking.countDocuments({ userId }).exec();
    logger.info('Total bookings count:', count);
    return count;
  }

  async findWalletByUserWithTransactions(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const result = await Wallet.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
        },
      },
      {
        $unwind: '$transactions',
      },
      {
        $sort: {
          'transactions.date': -1,
        },
      },
      {
        $group: {
          _id: '$_id',
          balance: { $first: '$balance' },
          totalTransactions: { $sum: 1 },
          transactions: { $push: '$transactions' },
        },
      },
      {
        $project: {
          balance: 1,
          totalTransactions: 1,
          transactions: {
            $slice: ['$transactions', skip, limit],
          },
        },
      },
    ]);
    return result[0] || null;
  }

  async getTransactionCount(userId: string): Promise<number> {
    const wallet = await Wallet.findOne({ userId }, { transactions: 1 });
    return wallet ? wallet.transactions.length : 0;
  }

  async findBookingById(bookingId: string): Promise<IBooking | null> {
    return Booking.findById(bookingId);
  }

  async saveBooking(bookingData: HydratedDocument<IBooking>): Promise<IBooking> {
    let booking = await bookingData.save();
    logger.info(booking);
    return booking;
  }

  async logWalletTransaction(
    userId: string,
    type: string,
    amount: number,
    description: string
  ): Promise<void> {
    const transaction = {
      type,
      amount,
      description,
    };

    await Wallet.updateOne({ userId }, { $push: { transactions: transaction } });
    logger.info('Transaction logged:', transaction);
  }

  async findWalletByUserId(userId: string): Promise<IWallet | null> {
    return Wallet.findOne({ userId });
  }

  async createWallet(userId: string): Promise<IWallet> {
    const wallet = new Wallet({
      userId,
      balance: 0,
      transactions: [],
    });
    await wallet.save();
    logger.info('Wallet created for userId:', userId);
    return wallet;
  }

  async saveWallet(wallet: IWallet): Promise<IWallet | null> {
    return Wallet.findOneAndUpdate({ userId: wallet.userId }, wallet, { new: true });
  }
}
export default CustomerDashBoardRepository;

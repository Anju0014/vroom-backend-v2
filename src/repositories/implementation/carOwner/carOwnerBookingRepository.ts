import ICarOwnerBookingRepository from '@repositories/interfaces/carOwner/ICarOwnerBookingRepository';
import { BaseRepository } from '@repositories/base/BaseRepository';
import { Car, ICar } from '@models/car/carModel';
import { Booking, IBooking } from '@models/booking/bookingModel';
import { IWallet, Wallet } from '@models/wallet/walletModel';
import logger from '@utils/logger';
import mongoose, { Types } from 'mongoose';
import { CarOwner } from '@models/carowner/carOwnerModel';

class CarOwnerBookingRepository extends BaseRepository<ICar> implements ICarOwnerBookingRepository {
  constructor() {
    super(Car);
  }

  async getBookingsForCarOwner(
    carOwnerId: string,
    page: number,
    limit: number,
    search?: string,
    status?: string
  ): Promise<{ bookings: IBooking[]; total: number }> {
    const query: any = {
      carOwnerId,
      status: { $in: ['confirmed', 'cancelled'] },
    };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');

      query.$or = [
        { bookingId: regex },
        { 'carId.carName': regex },
        { 'carId.brand': regex },
        { 'carId.model': regex },
        { 'userId.fullName': regex },
        { 'userId.email': regex },
      ];
    }

    const total = await Booking.countDocuments(query);

    const bookings = await Booking.find(query)
      .populate({
        path: 'userId',
        select: '_id fullName email',
      })
      .populate({
        path: 'carId',
        select: '_id carName brand model',
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { bookings, total };
  }

  async markCarReturned(bookingId: string): Promise<IBooking | null> {
    return Booking.findOneAndUpdate(
      {
        bookingId,
      },
      {
        $set: { isCarReturned: true },
      },
      { new: true }
    );
  }

  async findWalletByUserId(userId: string): Promise<IWallet | null> {
    return Wallet.findOne({ userId, userType: 'CarOwner' });
  }

  async createWallet(userId: string): Promise<IWallet> {
    const wallet = new Wallet({
      userId,
      userType: 'CarOwner',
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

  async countCars(carOwnerId: string): Promise<number> {
    return Car.countDocuments({
      owner: carOwnerId,
      verifyStatus: 1,
      isDeleted: false,
      available: true,
    });
  }

  async countBookings(carOwnerId: string): Promise<number> {
    return Booking.countDocuments({
      carOwnerId,
      status: { $in: ['confirmed', 'cancelled', 'completed', 'active'] },
    });
  }

  async countActiveBookings(carOwnerId: string): Promise<number> {
    const today = new Date();

    return Booking.countDocuments({
      carOwnerId,
      status: 'confirmed',
      startDate: { $lte: today },
      endDate: { $gte: today },
    });
  }

  async getEarnings(carOwnerId: string, startDate: Date) {
    return Booking.aggregate([
      {
        $match: {
          carOwnerId: new mongoose.Types.ObjectId(carOwnerId),
          status: { $in: ['completed', 'confirmed'] },
          endDate: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$endDate' },
          },
          total: { $sum: '$totalPrice' },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          amount: '$total',
        },
      },
    ]);
  }
  async getCarStats(carOwnerId: string) {
    const [available, verified, booked, maintenance] = await Promise.all([
      Car.countDocuments({
        owner: carOwnerId,
        available: true,
        isDeleted: false,
      }),
      Car.countDocuments({
        owner: carOwnerId,
        available: true,
        isDeleted: false,
        verifyStatus: 1,
      }),

      Car.countDocuments({
        owner: carOwnerId,
        available: false,
        isDeleted: false,
      }),

      Car.countDocuments({
        owner: carOwnerId,
        status: 'maintenance',
        isDeleted: false,
      }),
    ]);

    return {
      available,
      verified,
      booked,
      maintenance,
    };
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
          pendingPayout: { $first: '$pendingPayout' },
          totalWithdrawn: { $first: '$totalWithdrawn' },
          currency: { $first: '$currency' },
          payoutEnabled: { $first: '$payoutEnabled' },
          lastPayout: { $first: '$lastPayout' },

          totalTransactions: { $sum: 1 },

          transactions: { $push: '$transactions' },
        },
      },
      {
        $project: {
          balance: 1,
          pendingPayout: 1,
          totalWithdrawn: 1,
          currency: 1,
          payoutEnabled: 1,
          lastPayout: 1,
          totalTransactions: 1,
          transactions: {
            $slice: ['$transactions', skip, limit],
          },
        },
      },
    ]);

    return result[0] || null;
  }
  // async findWalletByUserWithTransactions(userId: string, page: number, limit: number) {
  //     const skip = (page - 1) * limit;

  //     const result = await Wallet.aggregate([
  //   {
  //     $match: {
  //       userId: new Types.ObjectId(userId),
  //     },
  //   },
  //   {
  //     $unwind: "$transactions",
  //   },
  //   {
  //     $sort: {
  //       "transactions.date": -1,
  //     },
  //   },
  //   {
  //     $group: {
  //       _id: "$_id",
  //       balance: { $first: "$balance" },
  //       totalTransactions: { $sum: 1 },
  //       transactions: { $push: "$transactions" },
  //     },
  //   },
  //   {
  //     $project: {
  //       balance: 1,
  //       totalTransactions: 1,
  //       transactions: {
  //         $slice: ["$transactions", skip, limit],
  //       },
  //     },
  //   },
  // ]);
  //     return result[0] || null;
  //   }

  async getTransactionCount(userId: string): Promise<number> {
    const wallet = await Wallet.findOne({ userId }, { transactions: 1 });
    return wallet ? wallet.transactions.length : 0;
  }
  async getPayoutStatus(userId: string): Promise<boolean> {
    const owner = await CarOwner.findById(userId);
    return owner?.payoutEnabled ?? false;
  }
}
export default CarOwnerBookingRepository;

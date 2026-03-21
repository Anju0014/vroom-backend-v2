import { Admin, IAdmin } from '@models/admin/adminModel';
import IAdminOwnerRepository from '@repositories/interfaces/admin/IAdminOwnerRepository';
import { BaseRepository } from '@repositories//base/BaseRepository';
import { CarOwner, ICarOwner } from '@models/carowner/carOwnerModel';
import { Car, ICar } from '@models/car/carModel';
import { Booking } from '@models/booking/bookingModel';
import { PipelineStage, Types } from 'mongoose';
import { buildSearchQuery } from '@utils/queryUtils';
import logger from '@utils/logger';
import { ICarPopulated } from '@models/car/carTypesModel';
import { Customer } from '@models/customer/customerModel';
import { IWallet, Wallet } from '@models/wallet/walletModel';

class AdminOwnerRepository extends BaseRepository<IAdmin> implements IAdminOwnerRepository {
  constructor() {
    super(Admin);
  }

  async getAllOwnerforVerify(
    page: number,
    limit: number,
    search: string
  ): Promise<{ carOwners: ICarOwner[]; total: number }> {
    try {
      const filter = {
        processStatus: 2,
        verifyStatus: 0,
        ...buildSearchQuery(search, ['fullName', 'email', 'phoneNumber']),
      };

      const carOwners = await CarOwner.find(filter, '-password -refreshToken')
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await CarOwner.countDocuments(filter);

      return { carOwners, total };
    } catch (error) {
      logger.error('Error in getAllOwnerVerify:', error);
      throw new Error('Database query failed');
    }
  }

  async getAllCarsforVerify(
    page: number,
    limit: number,
    search: string
  ): Promise<{ cars: ICarPopulated[]; total: number }> {
    try {
      const filter = {
        verifyStatus: 0,
        isDeleted: false,
        ...buildSearchQuery(search, ['carName', 'brand', 'model']),
      };

      const cars = await Car.find(filter)
        .populate('owner', 'fullName email phoneNumber')
        .skip((page - 1) * limit)
        .limit(limit)
        .lean<ICarPopulated[]>();

      const total = await Car.countDocuments(filter);

      return { cars: cars as ICarPopulated[], total };
    } catch (error) {
      logger.error('Error in getAllCarsVerify:', error);
      throw new Error('Database query failed');
    }
  }

  async getAllVerifiedCars(
    page: number,
    limit: number,
    search: string
  ): Promise<{ cars: ICarPopulated[]; total: number }> {
    try {
      const filter = {
        verifyStatus: 1,
        isDeleted: false,
        available: true,
        ...buildSearchQuery(search, ['carName', 'brand', 'model']),
      };

      const cars = await Car.find(filter)
        .populate('owner', 'fullName email phoneNumber')
        .skip((page - 1) * limit)
        .limit(limit)
        .lean<ICarPopulated[]>();

      const total = await Car.countDocuments(filter);

      return { cars: cars as ICarPopulated[], total };
    } catch (error) {
      logger.error('Error in getAllVerifiedCars:', error);
      throw new Error('Database query failed');
    }
  }

  async getAllBookings(
    page: number,
    limit: number,
    search: string
  ): Promise<{ bookings: any[]; total: number }> {
    try {
      const match: any = {
        status: { $in: ['confirmed', 'cancelled'] },
      };

      if (search) {
        const regex = new RegExp(search, 'i');
        match.$or = [
          { bookingId: regex },
          { 'customer.fullName': regex },
          { 'carOwner.fullName': regex },
          { 'car.carName': regex },
          { status: regex },
        ];
      }

      const pipeline: PipelineStage[] = [
        {
          $lookup: {
            from: 'customers',
            localField: 'userId',
            foreignField: '_id',
            as: 'customer',
          },
        },
        { $unwind: '$customer' },

        {
          $lookup: {
            from: 'carowners',
            localField: 'carOwnerId',
            foreignField: '_id',
            as: 'carOwner',
          },
        },
        { $unwind: '$carOwner' },

        {
          $lookup: {
            from: 'cars',
            localField: 'carId',
            foreignField: '_id',
            as: 'car',
          },
        },
        { $unwind: '$car' },

        { $match: match },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ];

      const bookings = await Booking.aggregate(pipeline);

      const totalPipeline = [...pipeline.slice(0, 7), { $count: 'total' }];
      const totalResult = await Booking.aggregate(totalPipeline);

      return { bookings, total: totalResult[0]?.total || 0 };
    } catch (err) {
      logger.error('Error in getAllBookings aggregation:', err);
      throw new Error('Failed to fetch bookings');
    }
  }

  async findCarOwnerById(ownerId: string): Promise<ICarOwner | null> {
    let response = await CarOwner.findById(ownerId);
    return response;
  }

  async updateOwnerStatus(
    ownerId: string,
    updateData: Partial<ICarOwner>
  ): Promise<ICarOwner | null> {
    return await CarOwner.findByIdAndUpdate(ownerId, updateData, { new: true });
  }

  async updateCarStatus(carId: string, updateData: Partial<ICar>): Promise<ICar | null> {
    return await Car.findByIdAndUpdate(carId, updateData, { new: true });
  }

  async findCarById(carId: string): Promise<ICar | null> {
    return Car.findById(carId);
  }

  async countCustomers(): Promise<number> {
    return Customer.countDocuments({
      processStatus: 2,
      verifyStatus: 1,
    });
  }

  async countOwners(): Promise<number> {
    return CarOwner.countDocuments({
      processStatus: 2,
      verifyStatus: 1,
    });
  }

  async countCars(): Promise<number> {
    return Car.countDocuments({
      verifyStatus: 1,
      isDeleted: false,
      available: true,
    });
  }

  async countBookings(): Promise<number> {
    return Booking.countDocuments({
      status: { $in: ['confirmed', 'cancelled', 'completed', 'active'] },
    });
  }

  async countActiveBookings(): Promise<number> {
    const today = new Date();

    return Booking.countDocuments({
      status: 'confirmed',
      startDate: { $lte: today },
      endDate: { $gte: today },
    });
  }
  async getTotalPlatformRevenue(): Promise<number> {
    const result = await Wallet.aggregate([
      { $match: { userType: 'Admin' } },
      { $unwind: '$transactions' },
      {
        $match: {
          'transactions.status': 'completed',
          'transactions.type': { $in: ['credit', 'cancellation'] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$transactions.amount' },
        },
      },
    ]);

    return result[0]?.total || 0;
  }
  async getEarnings(startDate: Date) {
    return Booking.aggregate([
      {
        $match: {
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
  async getCarStats() {
    const [available, verified, booked, maintenance] = await Promise.all([
      Car.countDocuments({
        available: true,
        isDeleted: false,
      }),
      Car.countDocuments({
        available: true,
        isDeleted: false,
        verifyStatus: 1,
      }),

      Car.countDocuments({
        available: false,
        isDeleted: false,
      }),

      Car.countDocuments({
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
  async getOwnerWallets(): Promise<IWallet[]> {
    return Wallet.find({ userType: 'CarOwner' })
      .populate('userId', 'fullName email payoutEnabled')
      .lean();
  }

  async getWalletByOwnerId(ownerId: string): Promise<IWallet | null> {
    return Wallet.findOne({
      userId: new Types.ObjectId(ownerId),
      userType: 'CarOwner',
    });
  }

  async savewallet(wallet: any): Promise<void> {
    return wallet.save();
  }
}
export default AdminOwnerRepository;

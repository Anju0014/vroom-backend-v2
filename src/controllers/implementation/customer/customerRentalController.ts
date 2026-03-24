import { Response, Request, NextFunction } from 'express';
import { CustomRequest } from '@middlewares/authMiddleWare';
import { MESSAGES } from '@constants/message';
import { StatusCode } from '@constants/statusCode';

import ICustomerRentalController from '@controllers/interfaces/customer/ICustomerRentalController';
import { ICustomerRentalService } from '@services/interfaces/customer/ICustomerRentalServices';
import { generateAndUploadReceipt } from '@services/receiptService';
import { Booking } from '@models/booking/bookingModel';
import { CustomerCarMapper } from '@mappers/customerCar.mapper';
import logger from '@utils/logger';
import { Wallet } from '@models/wallet/walletModel';
import crypto from 'crypto';
import ICustomerRentalRepository from '@repositories/interfaces/customer/ICustomerRentalRepository';
import { sendEmail } from '@utils/emailconfirm';
import { otpTemplate } from '@templates/emailTemplates';
import { PickupOtp } from '@models/otp/otpModel';
import { ApiError } from '@utils/apiError';

class CustomerRentalController implements ICustomerRentalController {
  private _customerRentalService: ICustomerRentalService;
  private _customerRentalRepository: ICustomerRentalRepository;

  constructor(
    _customerRentalService: ICustomerRentalService,
    _customerRentalRepository: ICustomerRentalRepository
  ) {
    this._customerRentalService = _customerRentalService;
    this._customerRentalRepository = _customerRentalRepository;
  }

  async getNearbyCars(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { lat, lng, maxDistance = '50' } = req.query;

    if (!lat || !lng) {
      res.status(StatusCode.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.ERROR.MISSING_COORDINATES,
      });
      return;
    }

    try {
      const cars = await this._customerRentalService.getNearbyCars(
        parseFloat(lat as string),
        parseFloat(lng as string),
        parseFloat(maxDistance as string)
      );
      res.status(StatusCode.OK).json({ success: true, data: CustomerCarMapper.toCarDTOs(cars) });
    } catch (error) {
      next(error);
    }
  }

  async getFeaturedCars(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('featuredcars');
      const cars = await this._customerRentalService.getFeaturedCars();
      res.status(StatusCode.OK).json({ success: true, data: CustomerCarMapper.toCarDTOs(cars) });
    } catch (error) {
      next(error);
    }
  }

  async getAllCars(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 9;
      const search = req.query.search as string;
      const minPrice = parseFloat(req.query.minPrice as string) || 0;
      const maxPrice = parseFloat(req.query.maxPrice as string) || Infinity;
      const carType = req.query.carType as string;
      const location = req.query.location as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      logger.info(
        'reached at getAllCars controller',
        search,
        minPrice,
        maxPrice,
        carType,
        location
      );
      if (page < 1 || limit < 1 || limit > 100) {
        throw new ApiError(StatusCode.BAD_REQUEST, MESSAGES.ERROR.INVALID_PAGE_OR_LIMIT);
      }

      const cars = await this._customerRentalService.getAllCars(page, limit, {
        search,
        minPrice,
        maxPrice,
        carType,
        location,
        startDate,
        endDate,
      });
      const total = await this._customerRentalService.getCarsCount({
        search,
        minPrice,
        maxPrice,
        carType,
        location,
        startDate,
        endDate,
      });
      logger.info('Cars:', cars, 'Total:', total);

      res.status(StatusCode.OK).json({ data: CustomerCarMapper.toCarDTOs(cars), total });
    } catch (error) {
      next(error);
    }
  }

  async getCarDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { carId } = req.params;
      const car = await this._customerRentalService.getCarDetail(carId);
      if (!car) {
        throw new ApiError(StatusCode.NOT_FOUND, MESSAGES.ERROR.NOT_FOUND);
      }
      res.status(StatusCode.OK).json({
        success: true,
        // data: CustomerCarMapper.toCarDetailDTO(car)
        data: car,
      });
    } catch (error) {
      next(error);
    }
  }

  async getbookedDatesCars(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { carId } = req.params;
      if (!carId) {
        throw new ApiError(StatusCode.BAD_REQUEST, MESSAGES.ERROR.MISSING_CAR_ID);
      }

      const bookedRanges = await this._customerRentalService.getBookedDateRanges(carId);
      logger.info('bookedRanges', bookedRanges);
      res.status(StatusCode.OK).json({
        success: true,
        // data: CustomerCarMapper.toBookedDateRangeDTO(bookedRanges)
        data: bookedRanges,
      });
    } catch (error) {
      next(error);
    }
  }

  async checkBookingAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
    logger.info('reached availability point');
    try {
      const { carId, startDate, endDate } = req.query;

      const bookings = await Booking.find({
        carId,
        $or: [
          {
            status: 'confirmed',
            startDate: { $lte: endDate },
            endDate: { $gte: startDate },
          },
          {
            status: 'pending',
            lockedUntil: { $gte: new Date() },
            startDate: { $lte: endDate },
            endDate: { $gte: startDate },
          },
        ],
      });

      if (bookings.length > 0) {
        logger.warn(false);
        res.json({ available: false });
        return;
      }
      logger.info(true);
      res.json({ available: true });
      return;
    } catch (error) {
      next(error);
    }
  }

  async createPendingBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('pending creation');
      const bookingId = await this._customerRentalService.createPendingBooking(req.body);
      res.status(StatusCode.CREATED).json({ success: true, bookingId });
    } catch (error) {
      next(error);
    }
  }
  async updatePendingBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    logger.info(' update pending booking');
    try {
      const { bookingId } = req.params;
      const { status } = req.body;

      console.log(bookingId);
      if (!bookingId) {
        console.log('errorat updatepending');
      }
      if (!status) {
        throw new ApiError(StatusCode.NOT_FOUND, MESSAGES.ERROR.MISSING_FIELDS);
      }

      const booking = await Booking.findById(bookingId);
      if (!booking) {
        throw new ApiError(StatusCode.NOT_FOUND, MESSAGES.ERROR.BOOKING_NOT_FOUND);
      }

      booking.status = status;
      await booking.save();

      res.status(StatusCode.OK).json({ message: 'Booking updated', booking });
    } catch (error) {
      next(error);
    }
  }

  async confirmBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { bookingId } = req.params;

    const { transactionId, paymentMethod } = req.body;

    if (!transactionId || !paymentMethod) {
      throw new ApiError(StatusCode.BAD_REQUEST, MESSAGES.ERROR.MISSING_FIELDS);
      // res
      //   .status(StatusCode.BAD_REQUEST)
      //   .json({ success: false, message: 'Missing transactionId or paymentMethod' });
      // return;
    }

    try {
      await this._customerRentalService.confirmBooking(bookingId, transactionId, paymentMethod);
      const receiptKey = await generateAndUploadReceipt(bookingId);
      res.status(StatusCode.OK).json({ success: true, bookingId, receiptKey });
    } catch (error) {
      next(error);
    }
  }

  async failedBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { bookingId } = req.params;
    try {
      await this._customerRentalService.failedBooking(bookingId);
      res.status(StatusCode.OK).json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  async updateCarTracking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bookingId, token, lat, lng } = req.body;

      await this._customerRentalService.updateTrackingLocation({
        bookingId,
        token,
        lat,
        lng,
      });

      res.status(StatusCode.OK).json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  async getBookingById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({
      bookingId: bookingId,
    });

    if (!booking) {
      throw new ApiError(StatusCode.NOT_FOUND, MESSAGES.ERROR.BOOKING_NOT_FOUND);
    }
    res.json({ data: booking });
  }

  // async requestPickupOtp(req: CustomRequest, res: Response): Promise<void> {
  //   const { bookingId } = req.params;
  //   const userId = req.userId;

  //   const booking = await Booking.findOne({
  //     bookingId: bookingId,
  //     userId,
  //   }).populate('userId', 'email');

  //   if (!booking) {
  //     res.status(StatusCode.NOT_FOUND).json({ message: 'Booking not found' });
  //     return;
  //   }

  //   const otp = crypto.randomInt(100000, 999999).toString();

  //   booking.pickupOtp = crypto.createHash('sha256').update(otp).digest('hex');

  //   booking.pickupOtpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

  //   await booking.save();
  //   await sendEmail({
  //     to: booking.userId.email,
  //     ...otpTemplate(otp),
  //   });

  //   res.json({ message: 'Pickup OTP sent to your email' });
  // }

  // async verifyPickupOtp(req: CustomRequest, res: Response): Promise<void> {
  //   const { bookingId } = req.params;
  //   const { otp } = req.body;
  //   const userId = req.userId;

  //   const booking = await Booking.findOne({
  //     bookingId: bookingId,
  //     userId,
  //   });

  //   if (!booking || !booking.pickupOtp) {
  //     res.status(StatusCode.BAD_REQUEST).json({ message: 'Invalid request' });
  //     return;
  //   }

  //   const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

  //   if (booking.pickupOtp !== hashedOtp || booking.pickupOtpExpiresAt < new Date()) {
  //     res.status(StatusCode.BAD_REQUEST).json({ message: 'Invalid or expired OTP' });
  //     return;
  //   }

  //   booking.pickupVerified = true;
  //   booking.pickupOtp = undefined;
  //   booking.pickupOtpExpiresAt = undefined;
  //   await booking.save();

  //   res.json({ message: 'Pickup verified successfully' });
  // }

  async requestPickupOtp(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    const { bookingId } = req.params;
    const userId = req.userId;

    const booking = await Booking.findOne({
      bookingId,
      userId,
    }).populate('userId', 'email');

    if (!booking) {
      throw new ApiError(StatusCode.NOT_FOUND, MESSAGES.ERROR.BOOKING_NOT_FOUND);
    }

    const otp = crypto.randomInt(100000, 999999).toString();

    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    await PickupOtp.deleteMany({ bookingId: booking._id });

    await PickupOtp.create({
      bookingId: booking._id,
      userId,
      otp: hashedOtp,
    });

    await sendEmail({
      to: booking.userId.email,
      ...otpTemplate(otp),
    });

    res.json({ message: 'Pickup OTP sent' });
  }

  async verifyPickupOtp(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    const { bookingId } = req.params;
    const { otp } = req.body;
    const userId = req.userId;

    const booking = await Booking.findOne({
      bookingId,
      userId,
    });

    if (!booking) {
      throw new ApiError(StatusCode.NOT_FOUND, MESSAGES.ERROR.BOOKING_NOT_FOUND);
    }

    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    const otpRecord = await PickupOtp.findOne({
      bookingId: booking._id,
      userId,
      otp: hashedOtp,
    });

    if (!otpRecord) {
      throw new ApiError(StatusCode.BAD_REQUEST, MESSAGES.ERROR.OTP_INVALID);
    }

    booking.pickupVerified = true;
    await booking.save();

    await PickupOtp.deleteMany({ bookingId: booking._id });

    res.json({ message: 'Pickup verified successfully' });
  }

  async payWithWallet(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    const { bookingId, amount } = req.body;
    const userId = req.userId;

    const wallet = await Wallet.findOne({ userId });
    const booking = await Booking.findOne({ _id: bookingId });
    if (!wallet) {
      throw new ApiError(StatusCode.NOT_FOUND, MESSAGES.ERROR.WALLET_NOT_FOUND);
    }
    if (!booking) {
      throw new ApiError(StatusCode.NOT_FOUND, MESSAGES.ERROR.BOOKING_NOT_FOUND);
    }

    if (wallet.balance < amount) {
      throw new ApiError(StatusCode.BAD_REQUEST, MESSAGES.ERROR.WALLET_BALANCE);
    }
    if (!booking.bookingId) {
      booking.bookingId = await this._customerRentalRepository.generateBookingId();
      await booking.save();
    }

    const transactionId = `wallet_${booking.bookingId}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    wallet.balance -= amount;
    wallet.transactions.push({
      transactionId,
      type: 'payment',
      amount,
      description: `Booking payment - ${booking.bookingId}`,
      date: new Date(),
    });
    await wallet.save();

    await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: 'paid',
      paymentMethod: 'wallet',
    });

    try {
      await this._customerRentalService.confirmBooking(bookingId, transactionId, 'wallet');
      const receiptKey = await generateAndUploadReceipt(bookingId);
      res.json({ success: true, bookingId, transactionId, receiptKey });
    } catch (error) {
      next(error);
    }
  }

  async getWalletBalance(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    const userId = req.userId;

    const wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      throw new ApiError(StatusCode.NOT_FOUND, MESSAGES.ERROR.WALLET_NOT_FOUND);
    }
    res.json({ balance: wallet.balance });
  }
}

export default CustomerRentalController;

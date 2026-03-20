import { NextFunction, Request, Response } from 'express';
import { CustomRequest } from '@middlewares/authMiddleWare';
import { MESSAGES } from '@constants/message';
import { StatusCode } from '@constants/statusCode';
import ICarOwnerBookingController from '@controllers/interfaces/carowner/ICarOwnerBookingController';
import { ICarOwnerBookingService } from '@services/interfaces/carOwner/ICarOwnerBookingServices';
import { Booking } from '@models/booking/bookingModel';
import { generateViewRecieptPresignedUrl } from '@services/s3Service';
import { OwnerBookingListResponseDTO } from '@dtos/booking/carOwnerBookingList.response.dto';
import { toBookingDTOs } from '@mappers/ownerBooking.mapper';
import logger from '@utils/logger';
import { OwnerWalletMapper } from '@mappers/ownerWallet.mapper';
import { CarOwner } from '@models/carowner/carOwnerModel';
import { stripe } from '@config/stripeConfig';
import { ApiError } from '@utils/apiError';

class CarOwnerBookingController implements ICarOwnerBookingController {
  private _ownerBookingService: ICarOwnerBookingService;

  constructor(_ownerBookingService: ICarOwnerBookingService) {
    this._ownerBookingService = _ownerBookingService;
  }

  async getCarOwnerBookings(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const carOwnerId = req.userId;
      if (!carOwnerId) {
        throw new ApiError(StatusCode.NOT_FOUND, MESSAGES.ERROR.NO_OWNER_ID_FOUND);
      }
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 9;
      if (page < 1 || limit < 1 || limit > 100) {
        throw new ApiError(StatusCode.BAD_REQUEST, MESSAGES.ERROR.INVALID_PAGE_OR_LIMIT);
      }
      const search = (req.query.search as string) || '';
      const status = (req.query.status as string) || '';
      const { bookings, total } = await this._ownerBookingService.getBookingsForCarOwner(
        carOwnerId,
        page,
        limit,
        search,
        status
      );
      const bookingDTOs = await toBookingDTOs(bookings);
      const response: OwnerBookingListResponseDTO = {
        bookings: bookingDTOs,
        total,
      };

      res.status(StatusCode.OK).json({
        success: true,
        ...response,
      });
    } catch (error) {
      next(error);
    }
  }

  async getReceiptUrl(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const { bookingId } = req.params;
      logger.info('bookingId', bookingId);
      const userId = req.userId;
      if (!bookingId) {
        throw new ApiError(StatusCode.BAD_REQUEST, MESSAGES.ERROR.INVALID_BOOKING_ID);
      }

      if (!userId) {
        throw new ApiError(StatusCode.UNAUTHORIZED, MESSAGES.ERROR.UNAUTHORIZED);
      }

      const booking = await Booking.findById(bookingId);

      if (!booking || !booking.receiptKey) {
        throw new ApiError(StatusCode.NOT_FOUND, MESSAGES.ERROR.RECEIPT_NOT_FOUND);
      }

      const isAuthorized =
        booking.userId.toString() === userId || booking.carOwnerId.toString() === userId;

      if (!isAuthorized) {
        throw new ApiError(StatusCode.FORBIDDEN, MESSAGES.ERROR.FORBIDDEN);
      }

      const url = await generateViewRecieptPresignedUrl(booking.receiptKey);

      logger.info(url);
      res.status(StatusCode.OK).json({
        success: true,
        url,
      });
    } catch (error) {
      next(error);
    }
  }

  async markCarReturned(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bookingId } = req.params;
      if (!bookingId) {
        throw new ApiError(StatusCode.BAD_REQUEST, MESSAGES.ERROR.MISSING_FIELDS);
      }

      await this._ownerBookingService.markCarReceived(bookingId);

      res.status(StatusCode.OK).json({
        success: true,
        message: 'Car marked as received successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getOwnerStats(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const carOwnerId = req.userId;
      const range = req.query.range as string;
      if (!carOwnerId) {
        throw new ApiError(StatusCode.NOT_FOUND, MESSAGES.ERROR.NO_OWNER_ID_FOUND);
      }
      const stats = await this._ownerBookingService.getOwnerStats(carOwnerId, range);
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.STATS_RETRIEVED ?? 'Vroom stats retrieved successfully',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOwnerWalletDetails(
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new ApiError(StatusCode.NOT_FOUND, MESSAGES.ERROR.MISSING_FIELDS);
      }

      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 9;

      if (page < 1 || limit < 1 || limit > 100) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: MESSAGES.ERROR.INVALID_PAGE_OR_LIMIT,
        });
        return;
      }

      const wallet = await this._ownerBookingService.getOwnerWallet(userId, page, limit);

      if (!wallet) {
        throw new ApiError(StatusCode.NOT_FOUND, MESSAGES.ERROR.WALLET_NOT_FOUND);
      }

      const total = await this._ownerBookingService.getOwnerWalletTransactionCount(userId);
      const payoutStatus = await this._ownerBookingService.getPayoutStatus(userId);
      const walletDTO = OwnerWalletMapper.toDTO(wallet);
      res.status(StatusCode.OK).json({
        success: true,
        data: {
          wallet: walletDTO,
          payoutStatus,
          total,
          page,
          limit,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async createConnectAccount(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = req.userId;

      const owner = await CarOwner.findById(ownerId);

      if (!owner) {
        throw new ApiError(StatusCode.NOT_FOUND, MESSAGES.ERROR.OWNER_NOT_FOUND);
      }

      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: owner.email,
        capabilities: {
          transfers: { requested: true },
        },
      });

      owner.stripeAccountId = account.id;
      await owner.save();

      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${process.env.FRONTEND_URL}/carOwner/dashboard/wallet`,
        return_url: `${process.env.FRONTEND_URL}/carOwner/dashboard/wallet?onboarding=complete`,
        type: 'account_onboarding',
      });

      res.json({
        url: accountLink.url,
      });
    } catch (error) {
      next(error);

      // res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
      //   error: 'Failed to create Stripe Connect account',
      // });
    }
  }
}

export default CarOwnerBookingController;

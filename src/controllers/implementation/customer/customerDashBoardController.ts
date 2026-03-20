import { Response, Request, NextFunction } from 'express';
import { CustomRequest } from '@middlewares/authMiddleWare';
import { MESSAGES } from '@constants/message';
import { StatusCode } from '@constants/statusCode';

import ICustomerDashBoardController from '@controllers/interfaces/customer/ICustomerDashBoardController';
import { ICustomerDashBoardService } from '@services/interfaces/customer/ICustomerDashBoardServices';
import { generateAndUploadReceipt } from '@services/receiptService';
import { CustomerBookingMapper } from '@mappers/customerBooking.mapper';
import logger from '@utils/logger';
import { CustomerWalletMapper } from '@mappers/customerWallet.mapper';
import { ApiError } from '@utils/apiError';

class CustomerDashBoardController implements ICustomerDashBoardController {
  private _customerDashService: ICustomerDashBoardService;

  constructor(_customerDashService: ICustomerDashBoardService) {
    this._customerDashService = _customerDashService;
  }

  async getCustomerBookingDetails(
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new ApiError(StatusCode.NOT_FOUND, MESSAGES.ERROR.MISSING_FIELDS);
      }
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 9;
      if (page < 1 || limit < 1 || limit > 100) {
        throw new ApiError(StatusCode.BAD_REQUEST, MESSAGES.ERROR.INVALID_PAGE_OR_LIMIT);
      }
      const bookings = await this._customerDashService.getCustomerBookings(userId, page, limit);
      const total = await this._customerDashService.getCustomerBookingCount(userId);
      const bookingDTOs = CustomerBookingMapper.toDTOList(bookings);
      res.status(StatusCode.OK).json({
        success: true,
        bookings: bookingDTOs,
        total,
      });
      return;
    } catch (error) {
      next(error);
    }
  }

  async cancelBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    logger.info('**************booking cancel controller*******************************');
    const { bookingId } = req.params;
    try {
      let booking = await this._customerDashService.cancelBooking(bookingId);
      await generateAndUploadReceipt(bookingId);
      logger.info('booking data', booking);
      res.status(StatusCode.OK).json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  async getCustomerwalletDetails(
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

      const wallet = await this._customerDashService.getCustomerWallet(userId, page, limit);

      if (!wallet) {
        throw new ApiError(StatusCode.BAD_REQUEST, MESSAGES.ERROR.MISSING_FIELDS);
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: 'Wallet not found',
        });
        return;
      }

      const total = await this._customerDashService.getCustomerWalletTransactionCount(userId);
      const walletDTO = CustomerWalletMapper.toDTO(wallet);

      res.status(StatusCode.OK).json({
        success: true,
        data: {
          wallet: walletDTO,
          total,
          page,
          limit,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default CustomerDashBoardController;

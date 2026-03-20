import { Response, Request, NextFunction } from 'express';
import IAdminOwnerController from '@controllers/interfaces/admin/IAdminOwnerController';
import { IAdminOwnerService } from '@services/interfaces/admin/IAdminOwnerServices';
import { StatusCode } from '@constants/statusCode';
import { MESSAGES } from '@constants/message';
import logger from '@utils/logger';
import { AdminOwnerMapper } from '@mappers/adminOwner.mapper';
import { ApiError } from '@utils/apiError';

class AdminOwnerController implements IAdminOwnerController {
  private _adminOwnerService: IAdminOwnerService;

  constructor(_adminOwnerService: IAdminOwnerService) {
    this._adminOwnerService = _adminOwnerService;
  }

  async getAllOwnersforVerify(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';
      const { carOwners, total } = await this._adminOwnerService.listAllOwnerforVerify(
        page,
        limit,
        search
      );

      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.OWNERS_FETCHED || 'Car owners fetched successfully',
        data: carOwners.map(AdminOwnerMapper.toOwnerVerifyDTO),
        total,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllCarsforVerify(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';
      const { cars, total } = await this._adminOwnerService.listAllCarsforVerify(
        page,
        limit,
        search
      );

      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.CARS_FETCHED || 'Cars fetched successfully',
        data: cars.map(AdminOwnerMapper.toCarVerifyDetailDTO),
        total,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllVerifiedCars(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';
      const { cars, total } = await this._adminOwnerService.listAllVerifiedCars(
        page,
        limit,
        search
      );

      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.CARS_FETCHED || 'Cars fetched successfully',
        data: cars.map(AdminOwnerMapper.toCarVerifyDetailDTO),
        total,
      });
    } catch (error) {
      next(error);
    }
  }
  async getAllBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';

      const { bookings, total } = await this._adminOwnerService.listAllBookings(
        page,
        limit,
        search
      );
      logger.info('Finished calling listAllBookings()');
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.BOOKINGS_FETCHED || 'Bookings fetched successfully',
        data: bookings.map(AdminOwnerMapper.toBookingListDTO),
        total,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateOwnerVerifyStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const { status, reason } = req.body;

      if (!userId || status === undefined) {
        throw new ApiError(StatusCode.NOT_FOUND, MESSAGES.ERROR.MISSING_FIELDS);
      }

      const verifyDetails =
        status === -1
          ? { verifyStatus: status, rejectionReason: reason }
          : { verifyStatus: status };
      let updatedOwner = await this._adminOwnerService.updateOwnerVerifyStatus(
        userId,
        verifyDetails
      );
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.STATUS_UPDATED || 'Owner status updated successfully',
        data: AdminOwnerMapper.toOwnerVerifyDTO(updatedOwner),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateOwnerBlockStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const { status } = req.body;
      if (!userId || status === undefined) {
        throw new ApiError(StatusCode.BAD_REQUEST, MESSAGES.ERROR.MISSING_FIELDS);
      }

      const updatedUser = await this._adminOwnerService.updateOwnerBlockStatus(userId, status);
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.STATUS_UPDATED || 'Owner status updated successfully',
        user: AdminOwnerMapper.toOwnerVerifyDTO(updatedUser),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCarBlockStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('show the details of block');
      const { carId } = req.params;
      const { status } = req.body;
      if (!carId || status === undefined) {
        throw new ApiError(StatusCode.BAD_REQUEST, MESSAGES.ERROR.MISSING_FIELDS);
      }

      const updatedCar = await this._adminOwnerService.updateCarBlockStatus(carId, status);
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.STATUS_UPDATED || 'Car status updated successfully',
        car: AdminOwnerMapper.toCarVerifyDTO(updatedCar),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCarVerifyStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { carId } = req.params;
      const { status, reason } = req.body;

      if (!carId || status === undefined) {
        throw new ApiError(StatusCode.NOT_FOUND, MESSAGES.ERROR.MISSING_FIELDS);
      }

      const verifyDetails =
        status === -1
          ? { verifyStatus: status, rejectionReason: reason }
          : { verifyStatus: status };
      let updatedCar = await this._adminOwnerService.updateCarVerifyStatus(carId, verifyDetails);
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.STATUS_UPDATED || 'Car status updated successfully',
        car: AdminOwnerMapper.toCarVerifyDTO(updatedCar),
      });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const range = req.query.range as string;
      const stats = await this._adminOwnerService.getAdminStats(range);
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.STATS_RETRIEVED ?? 'Vroom stats retrieved successfully',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  async getOwnerWallets(req: Request, res: Response, next: NextFunction) {
    try {
      const wallets = await this._adminOwnerService.getOwnerWallets();
      res.status(StatusCode.OK).json({
        success: true,
        data: wallets,
      });
    } catch (error) {
      next(error);
    }
  }

  async payoutOwner(req: Request, res: Response, next: NextFunction) {
    try {
      const { ownerId, amount } = req.body;
      console.log('reached');
      const payout = await this._adminOwnerService.payoutOwner(ownerId, amount);

      res.status(StatusCode.OK).json({
        success: true,
        data: payout,
      });
    } catch (error) {
      next(error);
    }
  }
}
export default AdminOwnerController;

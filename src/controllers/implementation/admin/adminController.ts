import { Response, Request } from 'express';
import IAdminController from '@controllers/interfaces/admin/IAdminController';
import { IAdminService } from '@services/interfaces/admin/IAdminServices';
import { StatusCode } from '@constants/statusCode';
import { MESSAGES } from '@constants/message';
import { getCookieOptions } from '@utils/cookieOptions';

import { AdminLoginRequestDTO } from '@dtos/admin/adminLogin.request.dto';
import { UpdateCustomerBlockStatusRequestDTO } from '@dtos/customer/customerStatusUpdate.request.dto';
import logger from '@utils/logger';
import { AdminMapper } from '@mappers/admin.mapper';
import { CustomerMapper } from '@mappers/customer.mapper';
import { CarOwnerMapper } from '@mappers/carOwner.mapper';
import { NextFunction } from 'express';
import { ApiError } from '@utils/apiError';

class AdminController implements IAdminController {
  private _adminService: IAdminService;

  constructor(_adminService: IAdminService) {
    this._adminService = _adminService;
  }

  async loginAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password }: AdminLoginRequestDTO = req.body;
      if (!email || !password) {
        throw new ApiError(StatusCode.BAD_REQUEST, MESSAGES.ERROR.MISSING_FIELDS);
      }

      const { accessToken, refreshToken, admin } = await this._adminService.loginAdmin(
        email,
        password
      );

      if (!admin) {
        throw new ApiError(StatusCode.NOT_FOUND, MESSAGES.ERROR.ADMIN_NOT_FOUND);
      }

      res.cookie('refreshToken', refreshToken, getCookieOptions(true));
      res.cookie('accessToken', accessToken, getCookieOptions(false));

      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.LOGIN_SUCCESS,
        ...AdminMapper.toLoginResponse(admin, accessToken),
      });
    } catch (error) {
      next(error);
    }
  }

  async logoutAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        logger.info('No refresh token found');
        throw new ApiError(StatusCode.BAD_REQUEST, MESSAGES.ERROR.NO_REFRESH_TOKEN);
      }
      await this._adminService.logoutAdmin(refreshToken);

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.LOGOUT_SUCCESS,
      });
    } catch (error) {
      next(error);
    }
  }

  async renewRefreshAccessTokenAdmin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      logger.info('Reached renewRefreshAccessAdmin');
      const oldRefreshToken = req.cookies.refreshToken;
      if (!oldRefreshToken) {
        throw new ApiError(StatusCode.UNAUTHORIZED, MESSAGES.ERROR.UNAUTHORIZED);
      }

      const { accessToken, refreshToken } =
        await this._adminService.renewAuthToken(oldRefreshToken);

      res.cookie('refreshToken', refreshToken, getCookieOptions(true));
      res.cookie('accessToken', accessToken, getCookieOptions(false));
      res.status(StatusCode.OK).json({ success: true, accessToken });
    } catch (error) {
      next(error);
    }
  }

  async getAllCustomers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';
      const { customers, total } = await this._adminService.listAllCustomers(page, limit, search);

      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.CUSTOMERS_FETCHED,
        data: CustomerMapper.toDTOList(customers),
        total,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllOwners(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';
      const { carOwners, total } = await this._adminService.listAllCarOwners(page, limit, search);

      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.OWNERS_FETCHED || 'Car owners fetched successfully',
        data: CarOwnerMapper.toDTOList(carOwners),
        total,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCustomerBlockStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const { status }: UpdateCustomerBlockStatusRequestDTO = req.body;
      if (!userId || status === undefined) {
        throw new ApiError(StatusCode.BAD_REQUEST, MESSAGES.ERROR.MISSING_FIELDS);
      }

      const updatedCustomer = await this._adminService.updateCustomerBlockStatus(userId, status);

      if (!updatedCustomer) {
        throw new ApiError(StatusCode.NOT_FOUND, MESSAGES.ERROR.CUSTOMER_NOT_FOUND);
      }

      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.STATUS_UPDATED || 'Customer status updated successfully',
        user: CustomerMapper.toDTO(updatedCustomer),
      });
    } catch (error) {
      next(error);
    }
  }
}
export default AdminController;

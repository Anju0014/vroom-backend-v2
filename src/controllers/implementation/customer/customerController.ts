import { NextFunction, Request, Response } from 'express';
import ICustomerController from '@controllers/interfaces/customer/ICustomerController';
import { ICustomerService } from '@services/interfaces/customer/ICustomerServices';
import { CustomRequest } from '@middlewares/authMiddleWare';
import { MESSAGES } from '@constants/message';
import { StatusCode } from '@constants/statusCode';
import { getCookieOptions } from '@utils/cookieOptions';
import { CustomerMapper } from '@mappers/customer.mapper';
import logger from '@utils/logger';
import { ApiError } from '@utils/apiError';

class CustomerContoller implements ICustomerController {
  private _customerService: ICustomerService;

  constructor(_customerService: ICustomerService) {
    this._customerService = _customerService;
  }

  async registerBasicDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { customer } = await this._customerService.registerBasicDetails(req.body);
      res.status(StatusCode.CREATED).json({
        success: true,
        message: MESSAGES.SUCCESS.OTP_SENT,
        data: CustomerMapper.toBasicRegisterDTO(customer),
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, otp } = req.body;
      await this._customerService.otpVerify(email, otp);
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.OTP_VERIFIED,
      });
    } catch (error) {
      next(error);
    }
  }

  async resendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        throw new ApiError(StatusCode.BAD_REQUEST, MESSAGES.ERROR.EMAIL_REQUIRED);
      }
      await this._customerService.resendOtp(email);
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.OTP_RESENT,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new ApiError(StatusCode.BAD_REQUEST, MESSAGES.ERROR.MISSING_FIELDS);
      }

      const { accessToken, refreshToken, customer } = await this._customerService.loginCustomer(
        email,
        password
      );

      res.cookie('refreshToken', refreshToken, getCookieOptions(true));
      res.cookie('accessToken', accessToken, getCookieOptions(false));
      if (!customer) {
        throw new ApiError(StatusCode.NOT_FOUND, MESSAGES.ERROR.CUSTOMER_NOT_FOUND);
      }
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.LOGIN_SUCCESS,
        ...CustomerMapper.toLoginDTO(customer, accessToken),
      });
    } catch (error) {
      next(error);
    }
  }

  async renewRefreshAccessToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('reached here at renewal');
      const oldRefreshToken = req.cookies.refreshToken;
      if (!oldRefreshToken) {
        throw new ApiError(StatusCode.UNAUTHORIZED, MESSAGES.ERROR.UNAUTHORIZED);
      }
      const { accessToken, refreshToken } =
        await this._customerService.renewAuthToken(oldRefreshToken);

      res.cookie('refreshToken', refreshToken, getCookieOptions(true));
      res.cookie('accessToken', accessToken, getCookieOptions(false));

      res.status(StatusCode.OK).json({ success: true, accessToken });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        throw new ApiError(StatusCode.BAD_REQUEST, MESSAGES.ERROR.EMAIL_REQUIRED);
      }
      await this._customerService.forgotPassword(email);
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.PASSWORD_RESET_SENT,
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        throw new ApiError(StatusCode.BAD_REQUEST, MESSAGES.ERROR.MISSING_FIELDS);
      }
      let role = 'customer';
      await this._customerService.resetPassword(token, newPassword, role);
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.PASSWORD_RESET_SUCCESSFULLY,
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const customerId = req.userId;

      if (!customerId) {
        throw new ApiError(StatusCode.UNAUTHORIZED, MESSAGES.ERROR.UNAUTHORIZED);
      }
      await this._customerService.changePassword(customerId, req.body);

      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.PASSWORD_UPDATE_SUCCESS,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        throw new ApiError(StatusCode.BAD_REQUEST, MESSAGES.ERROR.NO_REFRESH_TOKEN);
      }
      await this._customerService.logoutCustomer(refreshToken);

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

  async googleSignIn(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('*******************reached here at google signin');
      const { fullName, email, profileImage, provider, role } = req.body;
      logger.info(profileImage);
      if (!email || !provider) {
        throw new ApiError(StatusCode.BAD_REQUEST, MESSAGES.ERROR.MISSING_FIELDS);
      }

      const { accessToken, refreshToken, customer } =
        await this._customerService.loginCustomerGoogle(
          fullName,
          email,
          profileImage,
          provider,
          role
        );

      res.cookie('refreshToken', refreshToken, getCookieOptions(true));
      res.cookie('accessToken', accessToken, getCookieOptions(false));
      if (!customer) {
        throw new ApiError(StatusCode.BAD_REQUEST, MESSAGES.ERROR.CUSTOMER_NOT_FOUND);
      }

      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.LOGIN_SUCCESS,
        ...CustomerMapper.toLoginDTO(customer, accessToken),
      });
    } catch (error) {
      next(error);
    }
  }

  async getCustomerProfile(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const customerId = req.userId;
      if (!customerId) {
        throw new ApiError(StatusCode.UNAUTHORIZED, MESSAGES.ERROR.UNAUTHORIZED);
      }
      const { customer } = await this._customerService.getCustomerProfile(customerId);
      res.status(StatusCode.OK).json({
        success: true,
        customer: CustomerMapper.toDTO(customer),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfileCustomer(
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const customerId = req.userId;
      if (!customerId) {
        throw new ApiError(StatusCode.FORBIDDEN, MESSAGES.ERROR.NO_CUSTOMER_ID_FOUND);
      }
      const { phoneNumber, address, profileImage } = req.body;
      if (!phoneNumber && !address) {
        throw new ApiError(StatusCode.BAD_REQUEST, MESSAGES.ERROR.NO_UPDATE_DATA);
      }
      const updatedCustomer = await this._customerService.updateCustomerProfile(customerId, {
        phoneNumber,
        address,
        profileImage,
      });
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.PROFILE_UPDATED,
        updatedCustomer: CustomerMapper.toDTOUpdateProfile(updatedCustomer),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfileCustomerIdProof(
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const customerId = req.userId;
      if (!customerId) {
        throw new ApiError(StatusCode.FORBIDDEN, MESSAGES.ERROR.NO_CUSTOMER_ID_FOUND);
      }
      const { idProof } = req.body;
      logger.info('id', idProof);
      if (!idProof) {
        throw new ApiError(StatusCode.BAD_REQUEST, MESSAGES.ERROR.NO_UPDATE_DATA);
      }

      await this._customerService.updateCustomerProfileId(customerId, { idProof });

      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.ID_PROOF_UPDATED,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBlockStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('block status checking..................');
      const { userId } = req.params;
      const status = await this._customerService.checkBlockStatus(userId);
      res.status(StatusCode.OK).json({ blockStatus: status });
    } catch (error) {
      next(error);
    }
  }
}

export default CustomerContoller;

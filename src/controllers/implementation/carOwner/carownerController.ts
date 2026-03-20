import { NextFunction, Request, Response } from 'express';
import ICarOwnerController from '@controllers/interfaces/carowner/ICarOwnerContoller';
import { ICarOwnerService } from '@services/interfaces/carOwner/ICarOwnerServices';
import { CustomRequest } from '@middlewares/authMiddleWare';
import { MESSAGES } from '@constants/message';
import { StatusCode } from '@constants/statusCode';
import { getCookieOptions } from '@utils/cookieOptions';
import { CarOwnerMapper } from '@mappers/carOwner.mapper';
import logger from '@utils/logger';
import { ApiError } from '@utils/apiError';

class CarOwnerController implements ICarOwnerController {
  private _carOwnerService: ICarOwnerService;

  constructor(_carOwnerService: ICarOwnerService) {
    this._carOwnerService = _carOwnerService;
  }

  async registerBasicDetailsOwner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { carOwner } = await this._carOwnerService.registerBasicDetails(req.body);

      res.status(StatusCode.CREATED).json({
        success: true,
        message: MESSAGES.SUCCESS.OTP_SENT,
        data: CarOwnerMapper.toBasicRegisterDTO(carOwner),
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyOtpOwner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, otp } = req.body;

      await this._carOwnerService.otpVerify(email, otp);
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.OTP_VERIFIED,
      });
    } catch (error) {
      next(error);
    }
  }

  async resendOtpOwner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        throw new ApiError(StatusCode.BAD_REQUEST, MESSAGES.ERROR.EMAIL_REQUIRED);
      }

      await this._carOwnerService.resendOtp(email);
      res.status(StatusCode.OK).json({ success: true, message: MESSAGES.SUCCESS.OTP_RESENT });
    } catch (error) {
      next(error);
    }
  }

  async loginOwner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new ApiError(StatusCode.BAD_REQUEST, MESSAGES.ERROR.MISSING_FIELDS);
      }

      const { accessToken, refreshToken, carOwner } = await this._carOwnerService.loginCarOwner(
        email,
        password
      );

      res.cookie('refreshToken', refreshToken, getCookieOptions(true));
      res.cookie('accessToken', accessToken, getCookieOptions(false));

      if (!carOwner) {
        throw new ApiError(StatusCode.NOT_FOUND, MESSAGES.ERROR.OWNER_NOT_FOUND);
      }
      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.LOGIN_SUCCESS,
        ...CarOwnerMapper.toLoginDTO(carOwner, accessToken),
      });
    } catch (error) {
      next(error);
    }
  }

  async renewRefreshAccessTokenOwner(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      logger.info('Reached renewRefreshAccessTokenOwner');
      const oldRefreshToken = req.cookies.refreshToken;
      if (!oldRefreshToken) {
        throw new ApiError(StatusCode.UNAUTHORIZED, MESSAGES.ERROR.UNAUTHORIZED);
      }

      const { accessToken, refreshToken } =
        await this._carOwnerService.renewAuthToken(oldRefreshToken);

      res.cookie('refreshToken', refreshToken, getCookieOptions(true));
      res.cookie('accessToken', accessToken, getCookieOptions(false));
      res.status(StatusCode.OK).json({ success: true, accessToken });
    } catch (error) {
      next(error);
    }
  }

  async completeRegistration(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const carOwnerId = req.userId;

      if (!carOwnerId) {
        throw new ApiError(StatusCode.FORBIDDEN, MESSAGES.ERROR.NO_OWNER_ID_FOUND);
      }

      const completeOwner = await this._carOwnerService.completeRegister(carOwnerId, req.body);

      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.COMPLETED_REGISTRATION_FORM,
        completeOwner, //carOwnerMapper.ToDtoProfile
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPasswordOwner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        throw new ApiError(StatusCode.BAD_REQUEST, MESSAGES.ERROR.EMAIL_REQUIRED);
      }
      await this._carOwnerService.forgotPassword(email);
      res
        .status(StatusCode.OK)
        .json({ success: true, message: MESSAGES.SUCCESS.PASSWORD_RESET_SENT });
    } catch (error) {
      next(error);
    }
  }

  async resetPasswordOwner(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        throw new ApiError(StatusCode.BAD_REQUEST, MESSAGES.ERROR.MISSING_FIELDS);
      }
      let role = 'carOwner';
      await this._carOwnerService.resetPassword(token, newPassword, role);

      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.PASSWORD_RESET_SUCCESSFULLY,
      });
    } catch (error) {
      next(error);
    }
  }

  async changePasswordOwner(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = req.userId;
      if (!ownerId) {
        throw new ApiError(StatusCode.UNAUTHORIZED, MESSAGES.ERROR.UNAUTHORIZED);
      }
      const result = await this._carOwnerService.changePassword(ownerId, req.body);
      if (!result.success) {
        throw new ApiError(StatusCode.BAD_REQUEST, MESSAGES.ERROR.MISSING_FIELDS);
        res.status(StatusCode.BAD_REQUEST).json(result);
        return;
      }
      res.status(StatusCode.OK).json(result);
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
      await this._carOwnerService.logoutCarOwner(refreshToken);
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
      logger.info('reached here at google signin');
      const { fullName, email, profileImage, provider, role } = req.body;

      if (!email || !provider) {
        throw new ApiError(StatusCode.BAD_REQUEST, MESSAGES.ERROR.MISSING_FIELDS);
      }

      const { accessToken, refreshToken, carOwner } = await this._carOwnerService.loginOwnerGoogle(
        fullName,
        email,
        profileImage,
        provider,
        role
      );
      res.cookie('refreshToken', refreshToken, getCookieOptions(true));
      res.cookie('accessToken', accessToken, getCookieOptions(false));

      if (!carOwner) {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: MESSAGES.ERROR.CUSTOMER_NOT_FOUND,
        });
        return;
      }

      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.LOGIN_SUCCESS,
        accessToken,
        user: CarOwnerMapper.toPublicDTO(carOwner),
      });
    } catch (error) {
      next(error);
    }
  }

  async getOwnerProfile(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const ownerId = req.userId;
      if (!ownerId) {
        throw new ApiError(StatusCode.UNAUTHORIZED, MESSAGES.ERROR.UNAUTHORIZED);
      }
      const ownerProfile = await this._carOwnerService.getOwnerProfile(ownerId);
      if (!ownerProfile) {
        throw new ApiError(StatusCode.NOT_FOUND, MESSAGES.ERROR.PROFILE_NOT_FOUND);
      }
      res.status(StatusCode.OK).json({
        success: true,
        carOwner: CarOwnerMapper.toDTOProfile(ownerProfile),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfileOwner(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const carOwnerId = req.userId;

      if (!carOwnerId) {
        throw new ApiError(StatusCode.FORBIDDEN, MESSAGES.ERROR.NO_OWNER_ID_FOUND);
      }
      const { phoneNumber, address, profileImage } = req.body;
      if (!phoneNumber && !address) {
        throw new ApiError(StatusCode.BAD_REQUEST, MESSAGES.ERROR.NO_UPDATE_DATA);
      }
      const updatedOwner = await this._carOwnerService.updateCarOwnerProfile(carOwnerId, {
        phoneNumber,
        address,
        profileImage,
      });

      res.status(StatusCode.OK).json({
        success: true,
        message: MESSAGES.SUCCESS.PROFILE_UPDATED,
        updatedOwner: CarOwnerMapper.toDTOUpdateProfile(updatedOwner),
      });
    } catch (error) {
      next(error);
    }
  }

  async getBlockStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('block status checking..................');
      const { userId } = req.params;
      const status = await this._carOwnerService.checkBlockStatus(userId);

      res.status(StatusCode.OK).json({ blockStatus: status });
    } catch (error) {
      next(error);
    }
  }
}

export default CarOwnerController;

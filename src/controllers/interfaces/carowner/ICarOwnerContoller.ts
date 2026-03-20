import { NextFunction, Request, Response } from 'express';
interface ICarOwnerController {
  registerBasicDetailsOwner(req: Request, res: Response, next: NextFunction): Promise<void>;
  verifyOtpOwner(req: Request, res: Response, next: NextFunction): Promise<void>;
  resendOtpOwner(req: Request, res: Response, next: NextFunction): Promise<void>;
  loginOwner(req: Request, res: Response, next: NextFunction): Promise<void>;
  renewRefreshAccessTokenOwner(req: Request, res: Response, next: NextFunction): Promise<void>;
  forgotPasswordOwner(req: Request, res: Response, next: NextFunction): Promise<void>;
  resetPasswordOwner(req: Request, res: Response, next: NextFunction): Promise<void>;
  logout(req: Request, res: Response, next: NextFunction): Promise<void>;
}

export default ICarOwnerController;

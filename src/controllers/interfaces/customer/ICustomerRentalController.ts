import { CustomRequest } from '@middlewares/authMiddleWare';
import { NextFunction, Request, Response } from 'express';

interface ICustomerRentalController {
  getNearbyCars(req: Request, res: Response, next: NextFunction): Promise<void>;
  getFeaturedCars(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAllCars(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
  getCarDetail(req: Request, res: Response, next: NextFunction): Promise<void>;
  checkBookingAvailability(req: Request, res: Response, next: NextFunction): Promise<void>;
  createPendingBooking(req: Request, res: Response, next: NextFunction): Promise<void>;
  updatePendingBooking(req: Request, res: Response, next: NextFunction): Promise<void>;
  confirmBooking(req: Request, res: Response, next: NextFunction): Promise<void>;
  failedBooking(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateCarTracking(req: Request, res: Response, next: NextFunction): Promise<void>;
  getBookingById(req: Request, res: Response, next: NextFunction): Promise<void>;
  requestPickupOtp(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
  verifyPickupOtp(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
  payWithWallet(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
  getbookedDatesCars(req: Request, res: Response, next: NextFunction): Promise<void>;
  getWalletBalance(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
}

export default ICustomerRentalController;

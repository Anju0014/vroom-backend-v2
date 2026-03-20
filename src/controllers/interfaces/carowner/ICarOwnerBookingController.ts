import { NextFunction, Request, Response } from 'express';
import { CustomRequest } from '@middlewares/authMiddleWare';

interface ICarOwnerBookingController {
  getCarOwnerBookings(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
  getReceiptUrl(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
  markCarReturned(req: Request, res: Response, next: NextFunction): Promise<void>;
  getOwnerStats(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
  getOwnerWalletDetails(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
  createConnectAccount(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
}

export default ICarOwnerBookingController;

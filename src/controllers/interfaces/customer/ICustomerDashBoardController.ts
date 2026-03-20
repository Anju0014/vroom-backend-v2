import { CustomRequest } from '@middlewares/authMiddleWare';
import { NextFunction, Request, Response } from 'express';

interface CustomerDashBoardController {
  getCustomerBookingDetails(req: Request, res: Response, next: NextFunction): Promise<void>;
  cancelBooking(req: Request, res: Response, next: NextFunction): Promise<void>;
  getCustomerwalletDetails(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
}
export default CustomerDashBoardController;

import { NextFunction, Request, Response } from 'express';
interface IAdminOwnerController {
  getAllOwnersforVerify(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAllCarsforVerify(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateOwnerVerifyStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateOwnerBlockStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateCarVerifyStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAllBookings(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateCarBlockStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
}

export default IAdminOwnerController;

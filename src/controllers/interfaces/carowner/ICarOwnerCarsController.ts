import { NextFunction, Request, Response } from 'express';

interface ICarController {
  uploadCar(req: Request, res: Response, next: NextFunction): Promise<void>;
  getCarList(req: Request, res: Response, next: NextFunction): Promise<void>;
  deleteCar(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateCar(req: Request, res: Response, next: NextFunction): Promise<void>;
  getActiveBooking(req: Request, res: Response, next: NextFunction): Promise<void>;
}

export default ICarController;

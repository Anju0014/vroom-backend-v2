import { NextFunction, Request, Response } from 'express';
interface IAdminController {
  loginAdmin(req: Request, res: Response, next: NextFunction): Promise<void>;

  logoutAdmin(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAllCustomers(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAllOwners(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateCustomerBlockStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
}

export default IAdminController;

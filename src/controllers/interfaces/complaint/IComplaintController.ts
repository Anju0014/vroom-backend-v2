import { CustomRequest } from '@middlewares/authMiddleWare';
import { NextFunction, Request, Response } from 'express';

interface IComplaintController {
  createComplaint(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
  getMyComplaints(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
  getAllComplaints(req: Request, res: Response, next: NextFunction): Promise<void>;
  updateComplaintByAdmin(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export default IComplaintController;

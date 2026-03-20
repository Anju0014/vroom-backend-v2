import { CustomRequest } from '@middlewares/authMiddleWare';
import { NextFunction, Request, Response } from 'express';

interface IChatController {
  getChatHistory(req: Request, res: Response, next: NextFunction): Promise<void>;
  getOwnerChats(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
  getCustomerChats(req: CustomRequest, res: Response, next: NextFunction): Promise<void>;
}
export default IChatController;

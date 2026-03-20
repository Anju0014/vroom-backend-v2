import { Response, Request, NextFunction } from 'express';
import { CustomRequest } from '@middlewares/authMiddleWare';
import { StatusCode } from '@constants/statusCode';

import IChatController from '@controllers/interfaces/chat/IChatController';
import { IChatService } from '@services/interfaces/chat/IChatServices';
import { MESSAGES } from '@constants/message';
import logger from '@utils/logger';
import { ApiError } from '@utils/apiError';

class ChatController implements IChatController {
  private _chatService: IChatService;

  constructor(_chatService: IChatService) {
    this._chatService = _chatService;
  }

  async getChatHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roomId } = req.params;
      logger.info(',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,', roomId);
      const messages = await this._chatService.fetchMessages(roomId);
      res.status(StatusCode.OK).json(messages);
    } catch (error) {
      next(error);
    }
  }

  async getOwnerChats(req: CustomRequest, res: Response, next: NextFunction) {
    const ownerId = req.userId;
    if (!ownerId) {
      throw new ApiError(StatusCode.UNAUTHORIZED, MESSAGES.ERROR.UNAUTHORIZED);
    }

    try {
      const chats = await this._chatService.fetchOwnerChats(ownerId);
      logger.info('ChatService', chats);
      res.status(StatusCode.OK).json(chats);
    } catch (error) {
      next(error);
    }
  }

  async getCustomerChats(req: CustomRequest, res: Response, next: NextFunction) {
    const customerId = req.userId;
    if (!customerId) {
      throw new ApiError(StatusCode.UNAUTHORIZED, MESSAGES.ERROR.UNAUTHORIZED);
    }

    try {
      const chats = await this._chatService.fetchCustomerChats(customerId);
      logger.info('ChatService', chats);
      res.status(StatusCode.OK).json(chats);
    } catch (error) {
      next(error);
    }
  }
}
export default ChatController;

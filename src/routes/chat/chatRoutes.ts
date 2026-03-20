import { Router } from 'express';
import ChatController from '@controllers/implementation/chat/chatController';
import ChatService from '@services/implementation/chat/chatServices';
import ChatRepository from '@repositories/implementation/chat/chatRepository';
import authMiddleware from '@middlewares/authMiddleWare';
const chatRouter = Router();

const chatRepository = new ChatRepository();
const chatService = new ChatService(chatRepository);
const chatController = new ChatController(chatService);

chatRouter.get('/room/:roomId', (req, res, next) => chatController.getChatHistory(req, res, next));

chatRouter.get('/ownerchats', authMiddleware, (req, res, next) =>
  chatController.getOwnerChats(req, res, next)
);
chatRouter.get('/customerchats', authMiddleware, (req, res, next) =>
  chatController.getCustomerChats(req, res, next)
);
export default chatRouter;

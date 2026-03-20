import IChatRepository from '@repositories/interfaces/chat/IChatRepository';
import { IChatService } from '@services/interfaces/chat/IChatServices';

import { IChatMessage } from '@models/chatMessage/chatMessageModel';

import logger from '@utils/logger';
import { Customer } from '@models/customer/customerModel';
import { CarOwner } from '@models/carowner/carOwnerModel';
import { ApiError } from '@utils/apiError';
import { StatusCode } from '@constants/statusCode';

class ChatService implements IChatService {
  private _chatRepository: IChatRepository;

  constructor(chatRepository: IChatRepository) {
    this._chatRepository = chatRepository;
  }

  async addMessage(senderId: string, receiverId: string, message: string): Promise<IChatMessage> {
    const roomId = [senderId, receiverId].sort().join('_');
    const user = (await Customer.findById(senderId)) || (await CarOwner.findById(senderId));
    if (!user) throw new ApiError(StatusCode.BAD_REQUEST, 'Sender not found');
    return await this._chatRepository.saveMessage(roomId, senderId, receiverId, message);
  }

  async fetchMessages(roomId: string): Promise<IChatMessage[]> {
    return await this._chatRepository.getMessagesByRoom(roomId);
  }

  async fetchOwnerChats(ownerId: string): Promise<IChatMessage[]> {
    if (!ownerId) {
      logger.warn('saveMessage: owner not found, ownerId=%s', ownerId);
      throw new ApiError(StatusCode.BAD_REQUEST, 'Sender not found');
    }
    return await this._chatRepository.getActiveChatsByOwner(ownerId);
  }

  async fetchCustomerChats(customerId: string): Promise<IChatMessage[]> {
    if (!customerId) {
      logger.warn('saveMessage: customer not found, customerId=%s', customerId);
      throw new ApiError(StatusCode.BAD_REQUEST, 'Sender not found');
    }
    return await this._chatRepository.getActiveChatsByCustomer(customerId);
  }
}
export default ChatService;

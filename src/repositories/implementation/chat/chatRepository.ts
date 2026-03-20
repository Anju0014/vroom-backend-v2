import ChatMessage, { IChatMessage } from '../../../models/chatMessage/chatMessageModel';

import IChatRepository from '@repositories/interfaces/chat/IChatRepository';
import { BaseRepository } from '@repositories/base/BaseRepository';
import { Customer } from '@models/customer/customerModel';
import { CarOwner } from '@models/carowner/carOwnerModel';

class ChatRepository extends BaseRepository<IChatMessage> implements IChatRepository {
  constructor() {
    super(ChatMessage);
  }

  async saveMessage(
    roomId: string,
    senderId: string,
    receiverId: string,
    message: string
  ): Promise<IChatMessage> {
    const user = (await Customer.findById(senderId)) || (await CarOwner.findById(senderId));
    if (!user) throw new Error('Sender not found');

    return await ChatMessage.create({
      roomId,
      senderId,
      receiverId,
      participants: [senderId, receiverId],
      senderName: user.fullName,
      senderRole: user.role,
      message,
      timestamp: new Date(),
    });
  }

  async getMessagesByRoom(roomId: string): Promise<IChatMessage[]> {
    return await ChatMessage.find({ roomId }).sort({ timestamp: 1 }).limit(50).lean();
  }
  async getActiveChatsByOwner(ownerId: string): Promise<IChatMessage[]> {
    const messages = await ChatMessage.find({ participants: ownerId })
      .sort({ timestamp: 1 })
      .lean();

    return messages;
  }

  async getActiveChatsByCustomer(customerId: string): Promise<IChatMessage[]> {
    const messages = await ChatMessage.find({ participants: customerId })
      .sort({ timestamp: 1 })
      .lean();

    return messages;
  }
}

export default ChatRepository;

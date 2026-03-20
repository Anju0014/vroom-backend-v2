import { IChatMessage } from '@models/chatMessage/chatMessageModel';

interface IChatRepository {
  saveMessage(
    roomId: string,
    senderId: string,
    receiverId: string,
    message: string
  ): Promise<IChatMessage>;
  getMessagesByRoom(roomId: string): Promise<IChatMessage[]>;
  getActiveChatsByOwner(ownerId: string): Promise<IChatMessage[]>;
  getActiveChatsByCustomer(customerId: string): Promise<IChatMessage[]>;
}

export default IChatRepository;

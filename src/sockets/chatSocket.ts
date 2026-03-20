import { Server, Socket } from 'socket.io';

import ChatService from '@services/implementation/chat/chatServices';
import ChatRepository from '@repositories/implementation/chat/chatRepository';

const chatService = new ChatService(new ChatRepository());

export default function chatSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('Chat socket connected:', socket.id);

    socket.on('joinChatRoom', (roomId: string) => {
      socket.join(`chat_${roomId}`);
      console.log(`Socket ${socket.id} joined chat_${roomId}`);
    });

    socket.on('sendChatMessage', async ({ roomId, senderId, message }) => {
      const savedMessage = await chatService.addMessage(roomId, senderId, message);
      io.to(`chat_${roomId}`).emit('receiveChatMessage', savedMessage);
    });

    socket.on('disconnect', () => {
      console.log(`Chat socket disconnected: ${socket.id}`);
    });
  });
}

// import { Server, Socket } from 'socket.io';

// import ChatService from '@services/implementation/chat/chatServices';
// import ChatRepository from '@repositories/implementation/chat/chatRepository';

// const chatService = new ChatService(new ChatRepository());

// export default function chatSocket(io: Server) {
//   io.on('connection', (socket: Socket) => {
//     console.log('Chat socket connected:', socket.id);

//     socket.on('joinChatRoom', (roomId: string) => {
//       socket.join(`chat_${roomId}`);
//       console.log(`Socket ${socket.id} joined chat_${roomId}`);
//     });

//     socket.on('sendChatMessage', async ({ roomId, senderId, message }) => {
//       const savedMessage = await chatService.addMessage(roomId, senderId, message);
//       io.to(`chat_${roomId}`).emit('receiveChatMessage', savedMessage);
//     });

//     socket.on('disconnect', () => {
//       console.log(`Chat socket disconnected: ${socket.id}`);
//     });
//   });
// }

// import { Server, Socket } from 'socket.io';

// import ChatService from '../services/implementation/chat/chatServices';
// import ChatRepository from '../repositories/implementation/chat/chatRepository';

// const chatService = new ChatService(new ChatRepository());

// export default function chatSocket(io: Server) {
//   io.on('connection', (socket: Socket) => {
//     console.log('Chat socket connected:', socket.id);

//     // socket.on('joinChatRoom', (roomId: string) => {
//     //   socket.join(`chat_${roomId}`);
//     //   console.log(`Socket ${socket.id} joined chat_${roomId}`);
//     // });

//     socket.on('joinChatRoom', ({ senderId, receiverId }: { senderId: string, receiverId: string }) => {
//   const roomId = [senderId, receiverId].sort().join("_");
//   socket.join(`chat_${roomId}`);
//   console.log(`Socket ${socket.id} joined chat_${roomId}`);
// });

// socket.on('sendChatMessage', async ({ senderId, receiverId, message }) => {
//   // compute roomId consistently
//   const roomId = [senderId, receiverId].sort().join("_");

//   const savedMessage = await chatService.addMessage(senderId, receiverId, message);

//   // emit to everyone in the room
//   io.to(`chat_${roomId}`).emit('receiveChatMessage', savedMessage);
// });

// socket.on('leaveChatRoom', ({ senderId, receiverId }: { senderId: string, receiverId: string }) => {
//   const roomId = [senderId, receiverId].sort().join("_");
//   socket.leave(`chat_${roomId}`);
// });

// socket.on('disconnect', () => {
//   console.log(`Chat socket disconnected: ${socket.id}`);
// });

//     // socket.on('sendChatMessage', async ({ roomId, senderId, message }) => {
//     //   const savedMessage = await chatService.addMessage(roomId, senderId, message);
//     //   io.to(`chat_${roomId}`).emit('receiveChatMessage', savedMessage);
//     // });
// //     socket.on('sendChatMessage', async ({ senderId, receiverId, message }) => {
// //   const savedMessage = await chatService.addMessage(senderId, receiverId, message);
// //   const roomId = [senderId, receiverId].sort().join("_");
// //   io.to(`chat_${roomId}`).emit('receiveChatMessage', savedMessage);
// // });

// //     socket.on('disconnect', () => {
// //       console.log(`Chat socket disconnected: ${socket.id}`);
// //     });

// //     socket.on("leaveChatRoom", (roomId) => {
// //      socket.leave(roomId);
// //     });

//   });
// }

import { Server, Socket } from 'socket.io';
import ChatService from '../services/implementation/chat/chatServices';
import ChatRepository from '../repositories/implementation/chat/chatRepository';

const chatService = new ChatService(new ChatRepository());

interface JoinRoomPayload {
  senderId: string;
  receiverId: string;
}

interface SendMessagePayload extends JoinRoomPayload {
  message: string;
}

export default function chatSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('Chat socket connected:', socket.id);

    socket.on('joinChatRoom', ({ senderId, receiverId }: JoinRoomPayload) => {
      const roomId = [senderId, receiverId].sort().join('_');
      socket.join(`chat_${roomId}`);
      console.log(`Socket ${socket.id} joined chat_${roomId}`);
    });

    socket.on('sendChatMessage', async ({ senderId, receiverId, message }: SendMessagePayload) => {
      if (!message?.trim()) return;

      const roomId = [senderId, receiverId].sort().join('_');

      try {
        const savedMessage = await chatService.addMessage(senderId, receiverId, message);

        io.to(`chat_${roomId}`).emit('receiveChatMessage', savedMessage);
      } catch (error) {
        console.error('SendChatMessage error:', error);
        socket.emit('chatError', 'Message not sent');
      }
    });

    socket.on('leaveChatRoom', ({ senderId, receiverId }: JoinRoomPayload) => {
      const roomId = [senderId, receiverId].sort().join('_');
      socket.leave(`chat_${roomId}`);
    });

    socket.on('disconnect', () => {
      console.log('Chat socket disconnected:', socket.id);
    });
  });
}

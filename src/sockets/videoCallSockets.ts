// import { Server, Socket } from 'socket.io';

// export default function videoCallSocket(io: Server) {
//   io.on('connection', (socket: Socket) => {
//     console.log('Video socket connected:', socket.id);

//     socket.on('join-room', (roomId: string) => {
//       socket.join(roomId);
//       socket.to(roomId).emit('user-joined');
//     });

//     socket.on('offer', ({ roomId, offer }) => {
//       socket.to(roomId).emit('offer', offer);
//     });

//     socket.on('answer', ({ roomId, answer }) => {
//       socket.to(roomId).emit('answer', answer);
//     });

//     socket.on('ice-candidate', ({ roomId, candidate }) => {
//       socket.to(roomId).emit('ice-candidate', candidate);
//     });

//     socket.on('end-call', (roomId: string) => {
//       socket.to(roomId).emit('end-call');
//     });

//     socket.on('disconnect', () => {
//       console.log('Video socket disconnected:', socket.id);
//     });
//   });
// }

import { Server, Socket } from 'socket.io';

export default function videoCallSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('Video socket connected:', socket.id);

    socket.on('join-room', (roomId: string) => {
      socket.join(roomId);
      socket.to(roomId).emit('user-joined');
    });

    socket.on('offer', ({ roomId, offer }) => {
      socket.to(roomId).emit('offer', { offer });
    });

    socket.on('answer', ({ roomId, answer }) => {
      socket.to(roomId).emit('answer', { answer });
    });

    socket.on('ice-candidate', ({ roomId, candidate }) => {
      socket.to(roomId).emit('ice-candidate', { candidate });
    });

    socket.on('end-call', (roomId: string) => {
      socket.to(roomId).emit('end-call');
    });

    socket.on('disconnect', () => {
      console.log('Video socket disconnected:', socket.id);
    });
  });
}

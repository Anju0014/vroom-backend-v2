import mongoose from 'mongoose';
export interface OwnerChat {
  bookingId: string;
  lastMessage: string;
  lastSender: string;
  lastTime: Date;
  customerId?: mongoose.Types.ObjectId;
  carId?: mongoose.Types.ObjectId;
}

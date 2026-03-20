import { Schema, model, Document, Types } from 'mongoose';

export interface IPickupOtp extends Document {
  bookingId: Types.ObjectId;
  userId: Types.ObjectId;
  otp: string;
  createdAt: Date;
}

const pickupOtpSchema = new Schema<IPickupOtp>({
  bookingId: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // ⏱️ 5 minutes TTL
  },
});

export const PickupOtp = model<IPickupOtp>('PickupOtp', pickupOtpSchema);

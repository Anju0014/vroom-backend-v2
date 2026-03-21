import mongoose, { Document, Schema, Types } from 'mongoose';

interface ILocation {
  lat: number;
  lng: number;
}

interface IBooking extends Document<Types.ObjectId> {
  _id: Types.ObjectId;
  bookingId: string;
  carId: Types.ObjectId;
  userId: Types.ObjectId;
  carOwnerId: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'failed' | 'agreementAccepted';
  transactionId?: string;
  paymentMethod?: 'stripe' | 'wallet';
  cancellationFee: number;
  refundedAmount: number;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  trackingToken: string;
  trackingUrl: string;
  currentLocation?: ILocation;
  receiptKey?: string;
  lockedUntil?: Date;
  pickupOtp?: string;
  pickupOtpExpiresAt?: Date;
  pickupOtpRequestedAt?: Date;
  pickupVerified: boolean;
  pickupOtpAttempts: number;
  isCarReturned: boolean;
}

const BookingSchema = new Schema<IBooking>(
  {
    bookingId: { type: String, unique: true, sparse: true },
    carId: { type: Schema.Types.ObjectId, ref: 'Car', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'customer', required: true },
    carOwnerId: { type: Schema.Types.ObjectId, ref: 'CarOwner', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ['confirmed', 'pending', 'cancelled', 'failed', 'agreementAccepted', 'completed'],
      default: 'pending',
    },
    transactionId: { type: String, default: null },
    paymentMethod: {
      type: String,
      enum: ['stripe', 'wallet'],
    },
    cancellationFee: { type: Number },
    refundedAmount: { type: Number },
    cancelledAt: { type: Date },
    trackingToken: { type: String },
    trackingUrl: { type: String },
    receiptKey: { type: String },
    currentLocation: {
      lat: { type: Number },
      lng: { type: Number },
    },
    lockedUntil: { type: Date },
    pickupOtp: { type: String },
    pickupOtpExpiresAt: { type: Date },
    pickupOtpRequestedAt: { type: Date },
    pickupVerified: { type: Boolean, default: false },
    pickupOtpAttempts: { type: Number },
    isCarReturned: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

export { IBooking, Booking };

import mongoose, { Document, ObjectId, Schema } from 'mongoose';

interface IAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface ICustomer extends Document {
  _id: ObjectId;
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  isVerified: boolean;
  status: number;
  processStatus: number;
  verifyStatus: number;
  blockStatus: number;
  previousStatus: number | null;
  otp?: string | null;
  otpExpires?: Date | null;
  profileImage: string;
  googleId: string;
  idProof: string;
  idVerified: boolean;
  provider: string;
  refreshToken: string;
  role: 'customer';
  updatedAt?: Date;
  address?: IAddress;
  createdAt?: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
    },
    password: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    profileImage: {
      type: String,
    },
    role: {
      type: String,
      enum: ['customer'],
      default: 'customer',
    },
    processStatus: {
      type: Number,
      enum: [0, 1, 2, 3],
      default: 0,
    },
    blockStatus: {
      type: Number,
      enum: [0, 1],
      default: 0,
    },
    verifyStatus: {
      type: Number,
      enum: [-1, 0, 1],
      default: 0,
    },

    previousStatus: { type: Number, enum: [-1, 0, 1, 2], default: 0 },

    otp: { type: String, required: false },
    otpExpires: { type: Date, required: false, expires: 300 },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    refreshToken: { type: String, default: null },
    address: {
      addressLine1: { type: String },
      addressLine2: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String },
    },
    idProof: {
      type: String,
      required: false,
    },
    idVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Customer = mongoose.model<ICustomer>('customer', CustomerSchema);

export { ICustomer, Customer, IAddress };

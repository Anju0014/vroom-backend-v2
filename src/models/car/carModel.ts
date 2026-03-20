import mongoose, { Schema, Document, Types } from 'mongoose';

interface ICar extends Document<Types.ObjectId> {
  _id: Types.ObjectId;
  carName: string;
  brand: string;
  year?: string;
  fuelType?: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
  rcBookNo?: string;
  expectedWage: number;
  rcBookProof?: string;
  insuranceProof?: string;
  location: {
    address: string;
    landmark: string;
    coordinates: {
      type: 'Point';
      coordinates: [number, number]; // [lng, lat]
    };
  };
  make?: string;
  carModel?: string;
  carType?: string;
  verifyStatus: number;
  blockStatus: number;
  images: string[];
  videos?: string[];
  owner: mongoose.Types.ObjectId;
  available?: boolean;
  isDeleted?: boolean;
  unavailableDates: Date[];
  rejectionReason: string;
  createdAt: Date;
  updatedAt: Date;
}

const CarSchema = new Schema<ICar>(
  {
    carName: { type: String, required: true },
    brand: { type: String, required: true },
    year: { type: String },
    fuelType: {
      type: String,
      enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
    },
    carType: {
      type: String,
      enum: ['Sedan', 'SUV', 'Hatchback', 'VAN/MPV'],
    },
    blockStatus: {
      type: Number,
      enum: [0, 1],
      default: 0,
    },
    rcBookNo: { type: String, unique: true },
    expectedWage: { type: Number, required: true },
    rcBookProof: { type: String },
    insuranceProof: { type: String },
    location: {
      address: { type: String, required: true },
      landmark: { type: String, required: true },
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number], // [lng, lat]
          required: true,
        },
      },
    },
    make: { type: String },
    carModel: { type: String },
    verifyStatus: { type: Number, default: 0 },
    images: { type: [String], required: true },
    videos: { type: [String], default: [] },
    owner: { type: Schema.Types.ObjectId, ref: 'CarOwner', required: true },
    available: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    unavailableDates: { type: [Date], default: [] },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

CarSchema.index({ 'location.coordinates': '2dsphere' });

const Car = mongoose.model<ICar>('Car', CarSchema);
export { Car, ICar };

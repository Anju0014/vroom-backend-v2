import { Types } from 'mongoose';
import { IBooking } from './bookingModel';

export interface PopulatedBooking extends IBooking {
  carId: Types.ObjectId;
  userId: Types.ObjectId;
  carOwnerId: Types.ObjectId;

  carName: string;
  brand?: string;
  carNumber?: string;

  pickupLocation?: string;
  pickupCoordinates?: {
    lat: number;
    lng: number;
  };

  ownerName?: string;
  ownerContact?: string;

  receiptUrl?: string;
}

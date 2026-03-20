import { Types } from 'mongoose';
import { ICar } from '@models/car/carModel';

export interface IOwnerPopulated {
  _id: Types.ObjectId;
  fullName: string;
  email: string;
  phoneNumber: string;
}

export interface ICarPopulated extends Omit<ICar, 'owner'> {
  owner: IOwnerPopulated;
}

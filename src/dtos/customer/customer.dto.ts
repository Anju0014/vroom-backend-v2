import { IAddress } from '@models/customer/customerModel';

export interface CustomerDTO {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  isVerified: boolean;
  processStatus: number;
  verifyStatus: number;
  blockStatus: number;
  idVerified: boolean;
  idProof: string;
  profileImage?: string;
  role: string;
  createdAt?: Date;
  address?: IAddress;
}

export interface CustomerProfileUpdateDTO {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  isVerified: boolean;
  profileImage: string;
  role: string;
  address?: IAddress;
}

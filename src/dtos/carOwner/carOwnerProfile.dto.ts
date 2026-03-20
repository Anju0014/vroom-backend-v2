import { IAddress } from '@models/carowner/carOwnerModel';

export interface CarOwnerProfileDTO {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  profileImage?: string;
  address?: {
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  processStatus: number;
  verifyStatus: number;
}

export interface UpdateCarOwnerProfileRequestDTO {
  phoneNumber?: string;
  profileImage?: string;
  address?: {
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface OwnerProfileDTO {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  altPhoneNumber?: string;
  isVerified: boolean;
  processStatus: number;
  verifyStatus: number;
  blockStatus: number;
  idProof?: string;
  idVerified?: boolean;
  profileImage?: string;
  rejectionReason?: string;
  role: string;
  createdAt?: Date;
  address?: IAddress;
}

export interface OwnerProfileUpdateDTO {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  isVerified: boolean;
  profileImage: string;
  role: string;
  address?: IAddress;
}

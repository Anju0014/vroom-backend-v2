import { IAddress } from '@models/carowner/carOwnerModel';

export interface OwnerVerifyListItemDTO {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  verifyStatus: number;
  blockStatus: number;
  idVerified: boolean;
  rejectionReason?: string;
  createdAt?: Date;
  idProof?: string;
  address?: IAddress;
}

export interface OwnerVerifyListResponseDTO {
  carOwners: OwnerVerifyListItemDTO[];
  total: number;
}

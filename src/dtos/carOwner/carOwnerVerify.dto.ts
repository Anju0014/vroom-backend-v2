export interface CarOwnerVerifyListDTO {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  processStatus: number;
  verifyStatus: number;
  blockStatus: number;
  idVerified: boolean;
  createdAt?: Date;
}

export interface CarOwnerVerifyListResponseDTO {
  carOwners: CarOwnerVerifyListDTO[];
  total: number;
}

export interface UpdateOwnerVerifyRequestDTO {
  verifyStatus: -1 | 1;
  rejectionReason?: string;
}

export interface OwnerVerifyResponseDTO {
  id: string;
  verifyStatus: number;
  rejectionReason?: string;
}

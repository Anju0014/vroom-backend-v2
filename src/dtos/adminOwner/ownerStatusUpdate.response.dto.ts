export interface UpdateOwnerVerifyStatusRequestDTO {
  verifyStatus: number;
  rejectionReason?: string;
}

export interface UpdateOwnerBlockStatusRequestDTO {
  blockStatus: number;
}

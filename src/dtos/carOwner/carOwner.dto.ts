export interface CarOwnerDTO {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  altPhoneNumber?: string;
  isVerified: boolean;
  processStatus: number;
  verifyStatus: number;
  blockStatus: number;
  idVerified: boolean;
  rejectionReason?: string;
  profileImage?: string;
  createdAt?: Date;
}

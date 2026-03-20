export interface CarOwnerPublicDTO {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  profileImage?: string;
  blockStatus: number;
  processStatus: number;
  createdAt: Date;
}

export interface CarOwnerCarDTO {
  id: string;
  carName: string;
  expectedWage: number;
  verifyStatus: number;
  blockStatus: number;
  images?: string[];
  createdAt?: Date;
}

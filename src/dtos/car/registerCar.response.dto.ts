export interface RegisterCarResponseDTO {
  id: string;
  carName: string;
  verifyStatus: number;
  blockStatus: number;
  createdAt?: Date;
}

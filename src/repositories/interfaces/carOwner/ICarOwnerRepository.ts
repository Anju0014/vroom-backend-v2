import { ICarOwner } from '@models/carowner/carOwnerModel';

interface ICarOwnerRepository {
  findUserByEmail(email: string): Promise<ICarOwner | null>;
  create(user: Partial<ICarOwner>): Promise<ICarOwner>;
  updateCarOwner(ownerId: string, updatedData: Partial<ICarOwner>): Promise<ICarOwner>;
  updateRefreshToken(id: string, refreshToken: string): Promise<void>;
  updatePassword(ownerId: string, password: string): Promise<void>;
  clearRefreshToken(ownerId: string): Promise<void>;
  findUserByRefreshToken(refreshToken: string): Promise<ICarOwner | null>;
  findById(ownerId: string): Promise<ICarOwner | null>;
  getBlockStatusByUserId(userId: string): Promise<number>;
}

export default ICarOwnerRepository;

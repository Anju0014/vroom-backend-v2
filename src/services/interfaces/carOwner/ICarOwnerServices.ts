import { ICarOwner } from '@models/carowner/carOwnerModel';

export interface ICarOwnerService {
  registerBasicDetails(carOwnerDetails: Partial<ICarOwner>): Promise<{ carOwner: ICarOwner }>;
  otpVerify(email: string, otp: string): Promise<{ carOwner: ICarOwner }>;
  resendOtp(email: string): Promise<{ message: string }>;
  loginCarOwner(
    email: string,
    password: string
  ): Promise<{ carOwner: ICarOwner | null; refreshToken: string; accessToken: string }>;
  renewAuthToken(oldRefreshToken: string): Promise<{ accessToken: string; refreshToken: string }>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string, role: string): Promise<void>;
  changePassword(
    ownerId: string,
    passwordDetails: { oldPassword: string; newPassword: string }
  ): Promise<{ success: boolean; message: string }>;
  logoutCarOwner(refreshToken: string): Promise<void>;
  loginOwnerGoogle(
    fullName: string,
    email: string,
    googleId: string,
    image: string,
    provider: string,
    role?: string
  ): Promise<{ accessToken: string; refreshToken: string; carOwner: ICarOwner | null }>;
  getOwnerProfile(ownerId: string): Promise<ICarOwner>;
  updateCarOwnerProfile(OwnerId: string, updatedData: Partial<ICarOwner>): Promise<ICarOwner>;
  // updateCarOwnerProfileId(carOwnerId: string,updatedData: Partial<ICarOwner>): Promise<ICarOwner>

  completeRegister(ownerId: string, ownerDetails: Partial<ICarOwner>): Promise<ICarOwner>;
  // changePassword(ownerId:string)
  checkBlockStatus(userId: string): Promise<number>;
}

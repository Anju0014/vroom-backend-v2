interface ICustomerType {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  status: number;
  profilePic: string;
  provider: string;
  googleId: string;
  isVerified: boolean;
  otp?: string | null;
  otpExpires?: Date | null;
  refreshToken: string;
  updatedAt?: Date;
  createdAt?: Date;
}

export { ICustomerType };

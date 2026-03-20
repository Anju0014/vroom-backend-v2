export interface RegisterCarOwnerRequestDTO {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface RegisterCarOwnerResponseDTO {
  id: string;
  email: string;
  processStatus: number;
}

export interface OtpVerifyRequestDTO {
  email: string;
  otp: string;
}

export interface OtpVerifyResponseDTO {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export interface CarOwnerLoginResponseDTO {
  owner: {
    id: string;
    email: string;
    fullName: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface AuthTokenResponseDTO {
  accessToken: string;
  refreshToken: string;
}

export interface GenericMessageResponseDTO {
  message: string;
}

export interface LoginCarOwnerRequestDTO {
  email: string;
  password: string;
}

export interface LoginCarOwnerResponseDTO {
  accessToken: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    profileImage?: string;
  };
}

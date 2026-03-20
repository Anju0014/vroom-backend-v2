export interface ChangePasswordRequestDTO {
  oldPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponseDTO {
  success: boolean;
  message: string;
}

export interface ResetPasswordResponseDTO {
  message: string;
}

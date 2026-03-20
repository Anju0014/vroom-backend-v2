export interface AdminLoginResponseDTO {
  accessToken: string;
  admin: {
    id: string;
    email: string;
    role: 'admin';
  };
}

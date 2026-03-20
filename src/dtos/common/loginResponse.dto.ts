export interface LoginResponseDTO {
  accessToken: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    profileImage?: string;
  };
}

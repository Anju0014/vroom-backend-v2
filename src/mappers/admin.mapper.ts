import { IAdmin } from '@models/admin/adminModel';
import { AdminLoginResponseDTO } from '@dtos/admin/adminLogin.response.dto';

export class AdminMapper {
  static toLoginResponse(admin: IAdmin, accessToken: string): AdminLoginResponseDTO {
    return {
      accessToken,
      admin: {
        id: admin._id.toString(),
        email: admin.email,
        role: 'admin',
      },
    };
  }
}

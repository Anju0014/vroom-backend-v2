import { CreateComplaintDTO, UpdateComplaintByAdminDTO } from '@dtos/complaint/complaint.dto';
import { ComplaintAdminResponseDTO } from '@dtos/complaint/complaintAdminResponse.dto';

import { IComplaint } from '@models/complaint/complaintModel';

interface IComplaintService {
  createComplaint(
    data: CreateComplaintDTO,
    userId: string,
    role: 'customer' | 'carOwner'
  ): Promise<IComplaint>;

  getMyComplaints(
    userId: string,
    role: 'customer' | 'carOwner',
    page: number,
    limit: number
  ): Promise<{ complaints: IComplaint[] | null; total: number }>;

  getAllComplaints(
    page: number,
    limit: number,
    search: string
  ): Promise<{ complaints: ComplaintAdminResponseDTO[]; total: number }>;

  updateComplaintByAdmin(
    complaintId: string,
    data: UpdateComplaintByAdminDTO
  ): Promise<IComplaint | null>;
}

export default IComplaintService;

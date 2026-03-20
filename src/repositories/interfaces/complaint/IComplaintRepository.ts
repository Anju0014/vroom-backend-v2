import { IComplaint } from '@models/complaint/complaintModel';

interface IComplaintRepository {
  create(data: Partial<IComplaint>): Promise<IComplaint>;

  findByUser(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ complaints: IComplaint[]; total: number }>;

  findAll(
    page: number,
    limit: number,
    search: string
  ): Promise<{ complaints: IComplaint[]; total: number }>;

  findById(id: string): Promise<IComplaint | null>;

  updateById(id: string, update: Partial<IComplaint>): Promise<IComplaint | null>;
}
export default IComplaintRepository;

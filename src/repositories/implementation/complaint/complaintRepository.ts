import { Complaint, IComplaint } from '@models/complaint/complaintModel';
import IComplaintRepository from '@repositories/interfaces/complaint/IComplaintRepository';

class ComplaintRepository implements IComplaintRepository {
  async create(data: Partial<IComplaint>): Promise<IComplaint> {
    return await Complaint.create(data);
  }

  async findByUser(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ complaints: IComplaint[]; total: number }> {
    const complaints = await Complaint.find({ raisedBy: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Complaint.countDocuments({ raisedBy: userId });
    return { complaints, total };
  }

  async findAll(
    page: number,
    limit: number,
    search?: string
  ): Promise<{ complaints: IComplaint[]; total: number }> {
    const query: any = {};

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');

      query.$or = [
        { title: regex },
        { description: regex },
        { raisedByName: regex },
        { raisedByEmail: regex },
        { raisedByPhone: regex },
      ];
    }

    const total = await Complaint.countDocuments(query);

    const complaints = await Complaint.find(query)
      .populate('raisedBy', 'fullName email phoneNumber')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { complaints, total };
  }

  async findById(id: string): Promise<IComplaint | null> {
    return await Complaint.findById(id);
  }

  async updateById(id: string, update: Partial<IComplaint>): Promise<IComplaint | null> {
    return await Complaint.findByIdAndUpdate(id, update, { new: true });
  }
}
export default ComplaintRepository;

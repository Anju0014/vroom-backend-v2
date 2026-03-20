import { CreateComplaintDTO, UpdateComplaintByAdminDTO } from '@dtos/complaint/complaint.dto';

import IComplaintRepository from '@repositories/interfaces/complaint/IComplaintRepository';
import IComplaintService from '@services/interfaces/complaint/IComplaintServices';

import { Types } from 'mongoose';
import { Customer } from '../../../models/customer/customerModel';
import { CarOwner } from '../../../models/carowner/carOwnerModel';
import {
  ComplaintAdminResponseDTO,
  RaisedByUserDTO,
} from '@dtos/complaint/complaintAdminResponse.dto';
import { IComplaint } from '@models/complaint/complaintModel';

class ComplaintService implements IComplaintService {
  private _complaintRepository: IComplaintRepository;

  constructor(complaintRepository: IComplaintRepository) {
    this._complaintRepository = complaintRepository;
  }

  async createComplaint(data: CreateComplaintDTO, userId: string, role: 'customer' | 'carOwner') {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid userId');
    }

    return await this._complaintRepository.create({
      bookingId: data.bookingId,
      raisedBy: new Types.ObjectId(userId),
      raisedByRole: role,
      title: data.title,
      description: data.description,
      category: data.category,
      complaintProof: data.complaintProof,
      status: 'open',
      priority: 'medium',
    });
  }

  async getMyComplaints(
    userId: string,
    role: 'customer' | 'carOwner',
    page: number,
    limit: number
  ): Promise<{ complaints: IComplaint[] | null; total: number }> {
    const { complaints, total } = await this._complaintRepository.findByUser(userId, page, limit);
    return { complaints, total };
  }

  async getAllComplaints(
    page: number,
    limit: number,
    search: string
  ): Promise<{ complaints: ComplaintAdminResponseDTO[]; total: number }> {
    const { complaints, total } = await this._complaintRepository.findAll(page, limit, search);

    const customerIds = complaints
      .filter((c) => c.raisedByRole === 'customer')
      .map((c) => c.raisedBy);

    const carOwnerIds = complaints
      .filter((c) => c.raisedByRole === 'carOwner')
      .map((c) => c.raisedBy);

    const [customers, carOwners] = await Promise.all([
      Customer.find({ _id: { $in: customerIds } })
        .select('fullName email phoneNumber')
        .lean(),
      CarOwner.find({ _id: { $in: carOwnerIds } })
        .select('fullName email phoneNumber')
        .lean(),
    ]);

    const customerMap = new Map(customers.map((c) => [c._id.toString(), c]));

    const carOwnerMap = new Map(carOwners.map((o) => [o._id.toString(), o]));

    const response = complaints.map((c) => {
      let raisedByUser: RaisedByUserDTO | null = null;

      if (c.raisedByRole === 'customer') {
        const customer = customerMap.get(c.raisedBy.toString());
        if (customer) {
          raisedByUser = {
            _id: customer._id.toString(),
            fullName: customer.fullName,
            email: customer.email,
            phoneNumber: customer.phoneNumber,
            role: 'customer',
          };
        }
      }

      if (c.raisedByRole === 'carOwner') {
        const owner = carOwnerMap.get(c.raisedBy.toString());
        if (owner) {
          raisedByUser = {
            _id: owner._id.toString(),
            fullName: owner.fullName,
            email: owner.email,
            phoneNumber: owner.phoneNumber,
            role: 'carOwner',
          };
        }
      }

      return {
        _id: c._id.toString(),
        bookingId: c.bookingId,
        title: c.title,
        description: c.description,
        category: c.category,
        status: c.status,
        priority: c.priority,
        adminResponse: c.adminResponse,
        resolvedAt: c.resolvedAt,
        createdAt: c.createdAt,
        raisedByRole: c.raisedByRole,
        raisedByUser,
      };
    });

    return { complaints: response, total };
  }

  async updateComplaintByAdmin(complaintId: string, data: UpdateComplaintByAdminDTO) {
    const update: any = {
      status: data.status,
      priority: data.priority,
      adminResponse: data.adminResponse,
    };

    if (data.status === 'resolved') {
      update.resolvedAt = new Date();
    }

    return await this._complaintRepository.updateById(complaintId, update);
  }
}

export default ComplaintService;

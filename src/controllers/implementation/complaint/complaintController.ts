import { Response, Request, NextFunction } from 'express';
import { CustomRequest } from '@middlewares/authMiddleWare';
import { StatusCode } from '@constants/statusCode';

import IComplaintController from '@controllers/interfaces/complaint/IComplaintController';
import IComplaintService from '@services/interfaces/complaint/IComplaintServices';
import { MESSAGES } from '@constants/message';
import { mapComplaintToResponse } from '@dtos/complaint/complaintResponse.dto';
import { ApiError } from '@utils/apiError';

class ComplaintController implements IComplaintController {
  private _complaintService: IComplaintService;

  constructor(_complaintService: IComplaintService) {
    this._complaintService = _complaintService;
  }

  async createComplaint(req: CustomRequest, res: Response, next: NextFunction) {
    const { userId, role } = req;
    if (!userId || !role) {
      throw new ApiError(StatusCode.UNAUTHORIZED, MESSAGES.ERROR.UNAUTHORIZED);
    }
    if (role === 'admin') {
      throw new ApiError(StatusCode.FORBIDDEN, MESSAGES.ERROR.NO_ADMIN_COMPLAINT);
    }
    const complaint = await this._complaintService.createComplaint(req.body, userId, role);

    res.status(StatusCode.CREATED).json({
      message: 'Complaint created successfully',
      complaint: mapComplaintToResponse(complaint),
    });
    return;
  }

  async getMyComplaints(req: CustomRequest, res: Response, next: NextFunction) {
    const { userId, role } = req;
    if (!userId || !role) {
      throw new ApiError(StatusCode.UNAUTHORIZED, MESSAGES.ERROR.UNAUTHORIZED);
    }
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    if (page < 1 || limit < 1 || limit > 100) {
      throw new ApiError(StatusCode.BAD_REQUEST, MESSAGES.ERROR.INVALID_PAGE_OR_LIMIT);
    }
    if (role === 'admin') {
      throw new ApiError(StatusCode.BAD_REQUEST, MESSAGES.ERROR.NO_ADMIN_COMPLAINT);
    }

    const { complaints, total } = await this._complaintService.getMyComplaints(
      userId,
      role,
      page,
      limit
    );

    res.status(StatusCode.OK).json({ complaints, total });
    return;
  }

  async getAllComplaints(req: Request, res: Response, next: NextFunction) {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = (req.query.search as string)?.trim() || '';

    const { complaints, total } = await this._complaintService.getAllComplaints(
      page,
      limit,
      search
    );

    res.status(StatusCode.OK).json({ complaints, total });
  }

  async updateComplaintByAdmin(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    const updatedComplaint = await this._complaintService.updateComplaintByAdmin(id, req.body);

    res.status(StatusCode.OK).json({
      message: 'Complaint updated successfully',
      updatedComplaint,
    });
    return;
  }
}

export default ComplaintController;

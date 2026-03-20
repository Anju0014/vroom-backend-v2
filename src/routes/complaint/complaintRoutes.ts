import { Router } from 'express';

import ComplaintController from '@controllers/implementation/complaint/complaintController';
import ComplaintService from '@services/implementation/complaint/complaintService';
import ComplaintRepository from '@repositories/implementation/complaint/complaintRepository';
import authMiddleware, { verifyRole } from '../../middlewares/authMiddleWare';

const complaintRouter = Router();

const complaintRepository = new ComplaintRepository();
const complaintService = new ComplaintService(complaintRepository);
const complaintController = new ComplaintController(complaintService);

complaintRouter.post('/', authMiddleware, (req, res, next) =>
  complaintController.createComplaint(req, res, next)
);

complaintRouter.get('/', authMiddleware, (req, res, next) =>
  complaintController.getMyComplaints(req, res, next)
);

complaintRouter.get('/admin', authMiddleware, (req, res, next) =>
  complaintController.getAllComplaints(req, res, next)
);

complaintRouter.patch('/admin/:id', authMiddleware, verifyRole(['admin']), (req, res, next) =>
  complaintController.updateComplaintByAdmin(req, res, next)
);

export default complaintRouter;

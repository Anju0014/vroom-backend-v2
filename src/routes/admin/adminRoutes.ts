import { Router } from 'express';
import AdminController from '@controllers/implementation/admin/adminController';
import AdminRepository from '@repositories/implementation/admin/adminRepository';
import AdminService from '@services/implementation/admin/adminServices';

import AdminOwnerController from '@controllers/implementation/admin/adminOwnerController';
import AdminOwnerRepository from '@repositories/implementation/admin/adminOwnerRepository';
import AdminOwnerService from '@services/implementation/admin/adminOwnerServices';

const adminRouter = Router();

const adminRepository = new AdminRepository();
const adminService = new AdminService(adminRepository);
const adminController = new AdminController(adminService);

const adminOwnerRepository = new AdminOwnerRepository();
const adminOwnerService = new AdminOwnerService(adminOwnerRepository);
const adminOwnerController = new AdminOwnerController(adminOwnerService);

adminRouter.post('/auth/login', (req, res, next) => adminController.loginAdmin(req, res, next));

adminRouter.post('/auth/logout', (req, res, next) => adminController.logoutAdmin(req, res, next));

adminRouter.get('/customers', (req, res, next) => adminController.getAllCustomers(req, res, next));

adminRouter.get('/owners', (req, res, next) => adminController.getAllOwners(req, res, next));

adminRouter.post('/refresh-token', (req, res, next) =>
  adminController.renewRefreshAccessTokenAdmin(req, res, next)
);

adminRouter.get('/pendingcars', (req, res, next) =>
  adminOwnerController.getAllCarsforVerify(req, res, next)
);

adminRouter.get('/verifiedcars', (req, res, next) =>
  adminOwnerController.getAllVerifiedCars(req, res, next)
);

adminRouter.get('/bookings', (req, res, next) =>
  adminOwnerController.getAllBookings(req, res, next)
);

adminRouter.get('/ownerpending', (req, res, next) =>
  adminOwnerController.getAllOwnersforVerify(req, res, next)
);

adminRouter.patch('/customers/block-status/:userId', (req, res, next) =>
  adminController.updateCustomerBlockStatus(req, res, next)
);

adminRouter.patch('/owners/block-status/:userId', (req, res, next) =>
  adminOwnerController.updateOwnerBlockStatus(req, res, next)
);

adminRouter.patch('/owners/verify-status/:userId', (req, res, next) =>
  adminOwnerController.updateOwnerVerifyStatus(req, res, next)
);

adminRouter.patch('/cars/block-status/:carId', (req, res, next) =>
  adminOwnerController.updateCarBlockStatus(req, res, next)
);

adminRouter.patch('/cars/verify-status/:carId', (req, res, next) =>
  adminOwnerController.updateCarVerifyStatus(req, res, next)
);

adminRouter.get('/getstats', (req, res, next) => {
  adminOwnerController.getStats(req, res, next);
});

adminRouter.get('/owner-wallets', (req, res, next) => {
  adminOwnerController.getOwnerWallets(req, res, next);
});

adminRouter.post(`/owner-payout`, (req, res, next) => {
  adminOwnerController.payoutOwner(req, res, next);
});

export default adminRouter;

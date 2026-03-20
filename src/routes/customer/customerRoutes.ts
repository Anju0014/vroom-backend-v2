import { Router } from 'express';
import CustomerController from '@controllers/implementation/customer/customerController';
import CustomerService from '@services/implementation/customer/customerServices';
import CustomerRepository from '@repositories/implementation/customer/customerRepository';

import CustomerRentalController from '@controllers/implementation/customer/customerRentalController';
import CustomerRentalService from '@services/implementation/customer/customerRentalServices';
import CustomerRentalRepository from '@repositories/implementation/customer/customerRentalRepository';

import CustomerDashBoardController from '@controllers/implementation/customer/customerDashBoardController';
import CustomerDashBoardService from '@services/implementation/customer/customerDashBoardServices';
import CustomerDashBoardRepository from '@repositories/implementation/customer/customerDashBoardRepository';

import authMiddleware from '@middlewares/authMiddleWare';
import NotificationService from '@services/implementation/notification/notificationServices';
import NotificationRepository from '@repositories/implementation/notification/notificationRepository';
import AdminRepository from '@repositories/implementation/admin/adminRepository';
import WalletRepository from '@repositories/implementation/wallet/walletRepository';

const customerRouter = Router();

const customerRepository = new CustomerRepository();
const customerService = new CustomerService(customerRepository);
const customerController = new CustomerController(customerService);

const customerRentalRepository = new CustomerRentalRepository();

const adminRepository = new AdminRepository();
const walletRepository = new WalletRepository();

const notificationRepository = new NotificationRepository();
const notificationService = new NotificationService(notificationRepository);

const customerRentalService = new CustomerRentalService(
  customerRentalRepository,
  notificationService
);
const customerRentalController = new CustomerRentalController(
  customerRentalService,
  customerRentalRepository
);

const customerDashBoardRepository = new CustomerDashBoardRepository();
const customerDashBoardService = new CustomerDashBoardService(
  customerDashBoardRepository,
  walletRepository,
  adminRepository
);
const customerDashBoardController = new CustomerDashBoardController(customerDashBoardService);

customerRouter.post('/sign-up', (req, res, next) =>
  customerController.registerBasicDetails(req, res, next)
);

customerRouter.post('/verify-otp', (req, res, next) =>
  customerController.verifyOtp(req, res, next)
);

customerRouter.post('/resend-otp', (req, res, next) =>
  customerController.resendOtp(req, res, next)
);

customerRouter.post('/forgot-password', (req, res, next) =>
  customerController.forgotPassword(req, res, next)
);

customerRouter.post('/reset-password', (req, res, next) =>
  customerController.resetPassword(req, res, next)
);

customerRouter.post('/login', (req, res, next) => customerController.login(req, res, next));

customerRouter.post('/me/password', authMiddleware, (req, res, next) =>
  customerController.changePassword(req, res, next)
);

customerRouter.post('/refresh-token', (req, res, next) =>
  customerController.renewRefreshAccessToken(req, res, next)
);

customerRouter.post('/auth/logout', (req, res, next) => customerController.logout(req, res, next));

customerRouter.post('/auth/google', (req, res, next) =>
  customerController.googleSignIn(req, res, next)
);

// customerRouter.post('/googleSignOut', (req, res) => customerController.googleSignOut(req, res));

customerRouter.get('/me', authMiddleware, (req, res, next) =>
  customerController.getCustomerProfile(req, res, next)
);

customerRouter.put('/me', authMiddleware, (req, res, next) =>
  customerController.updateProfileCustomer(req, res, next)
);

customerRouter.put('/me/id-proof', authMiddleware, (req, res, next) =>
  customerController.updateProfileCustomerIdProof(req, res, next)
);

customerRouter.get('/checkblockstatus/:userId', authMiddleware, (req, res, next) =>
  customerController.getBlockStatus(req, res, next)
);

customerRouter.get('/car/nearby', (req, res, next) =>
  customerRentalController.getNearbyCars(req, res, next)
);

customerRouter.get('/car/featured', (req, res, next) =>
  customerRentalController.getFeaturedCars(req, res, next)
);

customerRouter.get('/cars', (req, res, next) =>
  customerRentalController.getAllCars(req, res, next)
);

customerRouter.get('/car/car-details/:carId', (req, res, next) =>
  customerRentalController.getCarDetail(req, res, next)
);

customerRouter.get('/car/booking-details/:carId', (req, res, next) =>
  customerRentalController.getbookedDatesCars(req, res, next)
);

customerRouter.post('/bookings/create', (req, res, next) =>
  customerRentalController.createPendingBooking(req, res, next)
);
customerRouter.get('/bookings/availability', (req, res, next) =>
  customerRentalController.checkBookingAvailability(req, res, next)
);
customerRouter.patch(`/bookings/:bookingId/confirm`, (req, res, next) =>
  customerRentalController.confirmBooking(req, res, next)
);
customerRouter.patch(`/bookings/:bookingId/pendingBooking`, (req, res, next) =>
  customerRentalController.updatePendingBooking(req, res, next)
);
customerRouter.patch(`/bookings/:bookingId/fail`, (req, res, next) =>
  customerRentalController.failedBooking(req, res, next)
);

customerRouter.get('/me/bookings', authMiddleware, (req, res, next) =>
  customerDashBoardController.getCustomerBookingDetails(req, res, next)
);

customerRouter.get('/me/wallet', authMiddleware, (req, res, next) =>
  customerDashBoardController.getCustomerwalletDetails(req, res, next)
);
customerRouter.patch(`/bookings/:bookingId/cancel`, (req, res, next) =>
  customerDashBoardController.cancelBooking(req, res, next)
);

customerRouter.post(`/tracking/update`, (req, res, next) =>
  customerRentalController.updateCarTracking(req, res, next)
);

customerRouter.get(`/bookings/:bookingId`, (req, res, next) =>
  customerRentalController.getBookingById(req, res, next)
);
customerRouter.post(`/bookings/:bookingId/request-pickup-otp`, authMiddleware, (req, res, next) =>
  customerRentalController.requestPickupOtp(req, res, next)
);
customerRouter.post(`/bookings/:bookingId/verify-pickup-otp`, authMiddleware, (req, res, next) =>
  customerRentalController.verifyPickupOtp(req, res, next)
);

customerRouter.get('/bookings/getBalance', authMiddleware, (req, res, next) => {
  customerRentalController.getWalletBalance(req, res, next);
});

customerRouter.post(`/bookings/:bookingId/verify-pickup-otp`, authMiddleware, (req, res, next) =>
  customerRentalController.verifyPickupOtp(req, res, next)
);

customerRouter.get('/test', authMiddleware, (req, res, next) => {
  customerRentalController.getWalletBalance(req, res, next);
});
customerRouter.post(`/bookings/payWithWalletBalance`, authMiddleware, (req, res, next) =>
  customerRentalController.payWithWallet(req, res, next)
);

export default customerRouter;

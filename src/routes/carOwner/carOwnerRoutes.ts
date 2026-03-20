import { Router } from 'express';
import CarOwnerController from '@controllers/implementation/carOwner/carownerController';
import CarOwnerService from '@services/implementation/carOwner/carOwnerServices';
import CarOwnerRepository from '@repositories/implementation/carOwner/carOwnerRepository';
import authMiddleware, { verifyRole } from '@middlewares/authMiddleWare';

import CarOwnerCarsController from '@controllers/implementation/carOwner/carOwnerCarsController';
import CarOwnerCarsService from '@services/implementation/carOwner/carOwnerCarsServices';
import CarOwnerCarsRepository from '@repositories/implementation/carOwner/carOwnerCarsRepository';

import CarOwnerBookingRepository from '@repositories/implementation/carOwner/carOwnerBookingRepository';
import CarOwnerBookingService from '@services/implementation/carOwner/carOwnerBookingServices';
import CarOwnerBookingController from '@controllers/implementation/carOwner/carOwnerBookingController';
import NotificationService from '@services/implementation/notification/notificationServices';
import NotificationRepository from '@repositories/implementation/notification/notificationRepository';
import AdminRepository from '@repositories/implementation/admin/adminRepository';
import WalletRepository from '@repositories/implementation/wallet/walletRepository';

const carOwnerRouter = Router();

const notificationRepository = new NotificationRepository();
const notificationService = new NotificationService(notificationRepository);

const adminRepository = new AdminRepository();
const walletRepository = new WalletRepository();

const carOwnerRepository = new CarOwnerRepository();
const carOwnerService = new CarOwnerService(
  carOwnerRepository,
  adminRepository,
  notificationService
);
const carOwnerController = new CarOwnerController(carOwnerService);

const carOwnerCarsRepository = new CarOwnerCarsRepository();
const carOwnerCarsService = new CarOwnerCarsService(
  carOwnerCarsRepository,
  carOwnerRepository,
  adminRepository,
  notificationService
);
const carOwnerCarsController = new CarOwnerCarsController(carOwnerCarsService);

const carOwnerBookingRepository = new CarOwnerBookingRepository();
const carOwnerBookingService = new CarOwnerBookingService(
  carOwnerBookingRepository,
  walletRepository,
  adminRepository
);
const carOwnerBookingController = new CarOwnerBookingController(carOwnerBookingService);

carOwnerRouter.post('/sign-up', (req, res, next) =>
  carOwnerController.registerBasicDetailsOwner(req, res, next)
);

carOwnerRouter.post('/verify-otp', (req, res, next) =>
  carOwnerController.verifyOtpOwner(req, res, next)
);

carOwnerRouter.post('/resend-otp', (req, res, next) =>
  carOwnerController.resendOtpOwner(req, res, next)
);

carOwnerRouter.post('/login', (req, res, next) => carOwnerController.loginOwner(req, res, next));

carOwnerRouter.post('/forgot-password', (req, res, next) =>
  carOwnerController.forgotPasswordOwner(req, res, next)
);

carOwnerRouter.post('/reset-password', (req, res, next) =>
  carOwnerController.resetPasswordOwner(req, res, next)
);

carOwnerRouter.post('/logout', (req, res, next) => carOwnerController.logout(req, res, next));

carOwnerRouter.post('/auth/google', (req, res, next) =>
  carOwnerController.googleSignIn(req, res, next)
);

carOwnerRouter.post('/refresh-token', (req, res, next) =>
  carOwnerController.renewRefreshAccessTokenOwner(req, res, next)
);

carOwnerRouter.post(
  '/complete-registration',
  authMiddleware,
  verifyRole(['carOwner']),
  (req, res, next) => carOwnerController.completeRegistration(req, res, next)
);

// carOwnerRouter.post("/googleSignOut",(req,res)=>carOwnerController.googleSignOut(req,res))

carOwnerRouter.get('/me', authMiddleware, (req, res, next) =>
  carOwnerController.getOwnerProfile(req, res, next)
);

carOwnerRouter.put('/me', authMiddleware, (req, res, next) =>
  carOwnerController.updateProfileOwner(req, res, next)
);

carOwnerRouter.post('/me/password', authMiddleware, (req, res, next) =>
  carOwnerController.changePasswordOwner(req, res, next)
);

carOwnerRouter.get('/checkblockstatus/:userId', authMiddleware, (req, res, next) =>
  carOwnerController.getBlockStatus(req, res, next)
);

carOwnerRouter.post('/car', authMiddleware, (req, res, next) =>
  carOwnerCarsController.uploadCar(req, res, next)
);

carOwnerRouter.get('/cars', authMiddleware, (req, res, next) =>
  carOwnerCarsController.getCarList(req, res, next)
);

carOwnerRouter.delete('/cars/:id', authMiddleware, (req, res, next) =>
  carOwnerCarsController.deleteCar(req, res, next)
);

carOwnerRouter.put('/cars/:id', authMiddleware, (req, res, next) =>
  carOwnerCarsController.updateCar(req, res, next)
);

carOwnerRouter.get('/cars/:id/bookings', authMiddleware, (req, res, next) =>
  carOwnerCarsController.getBookingsByCarId(req, res, next)
);
carOwnerRouter.patch('/cars/:id/availability', authMiddleware, (req, res, next) =>
  carOwnerCarsController.updateCarAvailability(req, res, next)
);

carOwnerRouter.get('/bookings', authMiddleware, (req, res, next) =>
  carOwnerBookingController.getCarOwnerBookings(req, res, next)
);

carOwnerRouter.get('/activebooking/:carId', authMiddleware, (req, res, next) =>
  carOwnerCarsController.getActiveBooking(req, res, next)
);

carOwnerRouter.get('/booking/:bookingId/receipt-url', authMiddleware, (req, res, next) =>
  carOwnerBookingController.getReceiptUrl(req, res, next)
);
carOwnerRouter.patch('/bookings/:bookingId/markCarReturned', authMiddleware, (req, res, next) =>
  carOwnerBookingController.markCarReturned(req, res, next)
);

carOwnerRouter.get('/getStats', authMiddleware, (req, res, next) => {
  carOwnerBookingController.getOwnerStats(req, res, next);
});

carOwnerRouter.get('/me/wallet', authMiddleware, (req, res, next) =>
  carOwnerBookingController.getOwnerWalletDetails(req, res, next)
);

carOwnerRouter.post('/create-account', authMiddleware, (req, res, next) =>
  carOwnerBookingController.createConnectAccount(req, res, next)
);
export default carOwnerRouter;

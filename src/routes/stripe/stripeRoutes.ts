import { Router } from 'express';
import {
  createConnectAccount,
  createPaymentData,
} from '@controllers/implementation/stripe/stripeController';

const router = Router();

router.post('/create-payment-intent', createPaymentData);
router.post('/create-account', createConnectAccount);

export default router;

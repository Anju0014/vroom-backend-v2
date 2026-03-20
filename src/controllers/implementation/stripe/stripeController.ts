import { Request, Response } from 'express';
import { stripe } from '@config/stripeConfig';
import { Booking } from '@models/booking/bookingModel';
import { StatusCode } from '@constants/statusCode';
import logger from '@utils/logger';
import { CustomRequest } from '@middlewares/authMiddleWare';
import { CarOwner } from '@models/carowner/carOwnerModel';

export const createPaymentData = async (req: Request, res: Response): Promise<void> => {
  logger.info('Received payment intent request:', req.body);
  const { carId, startDate, endDate, totalPrice, customerEmail, bookingId } = req.body;

  if (!carId || !startDate || !endDate || !totalPrice || !customerEmail || !bookingId) {
    logger.warn('Missing required fields:', {
      carId,
      startDate,
      endDate,
      totalPrice,
      customerEmail,
      bookingId,
    });
    res.status(StatusCode.BAD_REQUEST).json({
      error:
        'Missing required fields: carId, startDate, endDate, totalPrice, customerEmail, bookingId',
    });
    return;
  }

  if (!Number.isInteger(totalPrice) || totalPrice <= 0) {
    logger.log('Invalid totalPrice:', totalPrice);
    res.status(StatusCode.NOT_FOUND).json({ error: 'Valid totalPrice in rupees is required' });
    return;
  }

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking || booking.status !== 'agreementAccepted') {
      logger.info('Invalid or non-pending booking:', bookingId);
      res.status(StatusCode.NOT_FOUND).json({ error: 'Invalid or non-pending booking' });
      return;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100), // Convert rupees to paise
      currency: 'inr',
      payment_method_types: ['card'], // Match frontend PaymentElement
      receipt_email: customerEmail,
      metadata: {
        carId,
        startDate,
        endDate,
        bookingId,
        integration_check: 'accept_a_payment',
      },
    });

    logger.info('Payment intent created:', paymentIntent.id);
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    if (err instanceof Error && 'code' in err) {
      const statusCode =
        'statusCode' in err && typeof err.statusCode === 'number'
          ? err.statusCode
          : StatusCode.BAD_REQUEST;
      logger.error('Stripe error:', err.message);
      res.status(statusCode).json({ error: err.message });
      return;
    }
    logger.error('Unexpected error:', err);
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
  }
};

export const createConnectAccount = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.userId;

    const owner = await CarOwner.findById(ownerId);

    if (!owner) {
      res.status(StatusCode.NOT_FOUND).json({
        error: 'Owner not found',
      });
      return;
    }

    const account = await stripe.accounts.create({
      type: 'express',
      country: 'IN',
      email: owner.email,
      capabilities: {
        transfers: { requested: true },
      },
    });

    owner.stripeAccountId = account.id;
    await owner.save();

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.FRONTEND_URL}/owner/wallet`,
      return_url: `${process.env.FRONTEND_URL}/owner/wallet?onboarding=complete`,
      type: 'account_onboarding',
    });

    res.json({
      url: accountLink.url,
    });
  } catch (error) {
    logger.error('Stripe Connect Error:', error);

    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
      error: 'Failed to create Stripe Connect account',
    });
  }
};

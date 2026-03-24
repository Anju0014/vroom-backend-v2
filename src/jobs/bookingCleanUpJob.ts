import cron from 'node-cron';
import { Booking } from '@models/booking/bookingModel';

cron.schedule('0 0 * * *', async () => {
  try {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    const result = await Booking.deleteMany({
      status: 'agreementAccepted',
      lockedUntil: { $lt: new Date() },
      createdAt: { $lt: twoDaysAgo },
    });

    console.log(`Deleted ${result.deletedCount} stale bookings`);
  } catch (error) {
    console.error('Cron job error:', error);
  }
});

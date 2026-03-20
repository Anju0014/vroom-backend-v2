import cron from 'node-cron';
import { Booking } from '@models/booking/bookingModel';
import { sendEmail } from '@utils/emailconfirm';
import { trackingEmailTemplate } from '@templates/emailTemplates';

cron.schedule('0 0 * * *', async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const startOfDay = new Date(tomorrow.setHours(0, 0, 0, 0));
  const endOfDay = new Date(tomorrow.setHours(23, 59, 59, 999));

  const bookings = await Booking.find({
    startDate: { $gte: startOfDay, $lte: endOfDay },
    status: 'confirmed',
  }).populate('userId', 'name email');

  for (const booking of bookings) {
    const trackingContent = trackingEmailTemplate(booking.trackingUrl);
    await sendEmail({ to: booking.userId.email, ...trackingContent });
  }
});

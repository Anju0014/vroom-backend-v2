import PDFDocument from 'pdfkit';
import { Booking } from '@models/booking/bookingModel';
import { s3 } from '@config/s3Config';
import { PutObjectCommand } from '@aws-sdk/client-s3';

export async function generateAndUploadReceipt(bookingId: string): Promise<string> {
  const booking = await Booking.findById(bookingId)
    .populate('userId', 'fullName email')
    .populate('carOwnerId', 'fullName phone')
    .populate('carId', 'carName brand rcBookNo location.address');

  if (!booking) throw new Error('Booking not found');

  const doc = new PDFDocument({ margin: 40, size: [595, 650] }); // Reduced height

  const primaryBlue = '#1E40AF';
  const accentYellow = '#FCD34D';
  const darkGray = '#374151';
  const lightGray = '#6B7280';

  const buffer: Buffer = await new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.rect(0, 0, doc.page.width, 90).fill(primaryBlue);

    doc.circle(60, 45, 25).fill(accentYellow);
    doc.fontSize(20).fillColor('#FFFFFF').text('V', 50, 33);
    doc.fontSize(24).fillColor('#FFFFFF').text('VROOM', 100, 30);
    doc.fontSize(11).fillColor(accentYellow).text('Car Rental Services', 100, 58);
    doc
      .fontSize(16)
      .fillColor('#FFFFFF')
      .text('RECEIPT', doc.page.width - 140, 35);

    const statusColor = booking.status === 'cancelled' ? '#EF4444' : '#15e623ff';
    doc
      .fontSize(10)
      .fillColor(statusColor)
      .text(booking.status.toUpperCase(), doc.page.width - 140, 58);
    doc.fillColor(darkGray);

    let yPos = 110;
    doc.fontSize(10).fillColor(lightGray).text('Booking ID:', 40, yPos);
    doc
      .fontSize(12)
      .fillColor(primaryBlue)
      .font('Helvetica-Bold')
      .text(booking.bookingId, 150, yPos);

    yPos += 30;
    const col1 = 40;
    const col2 = 300;

    doc.font('Helvetica-Bold').fontSize(11).fillColor(primaryBlue).text('CUSTOMER', col1, yPos);
    doc.font('Helvetica-Bold').fontSize(11).fillColor(primaryBlue).text('VEHICLE', col2, yPos);

    yPos += 20;

    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor(darkGray)
      .text(booking.userId?.fullName || 'N/A', col1, yPos);
    doc.text(`${booking.carId?.brand || 'N/A'} ${booking.carId?.carName || ''}`, col2, yPos);

    yPos += 15;

    doc
      .fontSize(9)
      .fillColor(lightGray)
      .text(booking.userId?.email || 'N/A', col1, yPos, { width: 240 });
    doc.fillColor(darkGray).text(booking.carId?.rcBookNo || 'N/A', col2, yPos);

    yPos += 30;

    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor(primaryBlue)
      .text('RENTAL PERIOD', col1, yPos);

    yPos += 20;

    const startDate = new Date(booking.startDate).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const endDate = new Date(booking.endDate).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor(darkGray)
      .text(`${startDate}   TO   ${endDate}`, col1, yPos);

    yPos += 30;

    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor(primaryBlue)
      .text('PICKUP LOCATION', col1, yPos);

    yPos += 20;

    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor(darkGray)
      .text(booking.carId?.location?.address || 'N/A', col1, yPos, {
        width: doc.page.width - 80,
      });

    yPos += 35;

    doc.rect(40, yPos, doc.page.width - 80, 45).fill(primaryBlue);
    doc
      .fontSize(11)
      .fillColor(accentYellow)
      .font('Helvetica-Bold')
      .text('TOTAL PAID', 50, yPos + 10);
    doc
      .fontSize(20)
      .fillColor('#FFFFFF')
      .text(`${booking.totalPrice.toLocaleString('en-IN')}`, 50, yPos + 25);
    doc
      .fontSize(8)
      .fillColor('#FFFFFF')
      .text(`Owner: ${booking.carOwnerId?.fullName || 'N/A'}`, doc.page.width - 180, yPos + 20);

    yPos += 65;

    doc
      .moveTo(40, yPos)
      .lineTo(doc.page.width - 40, yPos)
      .strokeColor(lightGray)
      .lineWidth(0.5)
      .stroke();
    doc
      .fontSize(8)
      .fillColor(lightGray)
      .text('Thank you for choosing Vroom!', 40, yPos + 10, {
        align: 'center',
        width: doc.page.width - 80,
      });
    doc.fontSize(7).text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 40, yPos + 25, {
      align: 'center',
      width: doc.page.width - 80,
    });

    doc.end();
  });

  const key = `receipts/booking-${booking.bookingId}${
    booking.status === 'cancelled' ? '-cancelled' : ''
  }.pdf`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: 'application/pdf',
    })
  );

  booking.receiptKey = key;
  await booking.save();

  return key;
}

import 'reflect-metadata';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import connectDB from '@config/dbConfig';
import cookieParser from 'cookie-parser';
import customerRouter from '@routes/customer/customerRoutes';
import carOwnerRouter from '@routes/carOwner/carOwnerRoutes';
import adminRouter from '@routes/admin/adminRoutes';
import s3Routes from '@routes/s3/s3Routes';
import chatRouter from '@routes/chat/chatRoutes';
import stripeRoutes from '@routes/stripe/stripeRoutes';
import { initSockets } from '@sockets/socket';
import '@jobs/bookingTrackingJob';
import notificationRouter from '@routes/notification/notificationRoutes';
import complaintRouter from '@routes/complaint/complaintRoutes';
import { errorMiddleware } from '@middlewares/errorMiddleWare';

dotenv.config();
connectDB();
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie'],
  })
);

app.use('/', customerRouter);
app.use('/owner', carOwnerRouter);
app.use('/admin', adminRouter);
app.use('/api/s3', s3Routes);
app.use('/api/stripe', stripeRoutes);
app.use('/chats', chatRouter);
app.use('/notifications', notificationRouter);
app.use('/complaints', complaintRouter);

app.use(errorMiddleware);

initSockets(server);

server.listen(PORT, () => {
  console.log(`Server Connected to ${PORT}`);
});

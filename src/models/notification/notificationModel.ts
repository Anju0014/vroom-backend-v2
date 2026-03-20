import mongoose, { Schema, Document, Types } from 'mongoose';

interface INotification extends Document {
  _id: Types.ObjectId;
  userId: string;
  role: 'ADMIN' | 'OWNER' | 'CUSTOMER';
  title: string;
  message: string;
  type: string;
  iconKey: string;
  severity: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: String, required: true, index: true },
    role: { type: String, enum: ['ADMIN', 'OWNER', 'CUSTOMER'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, required: true },
    iconKey: { type: String },
    severity: { type: String },
    metadata: { type: Schema.Types.Mixed },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = mongoose.model<INotification>('notification', NotificationSchema);
export { INotification, Notification };

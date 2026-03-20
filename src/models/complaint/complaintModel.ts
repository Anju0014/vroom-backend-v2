import { Schema, model, Types, Document } from 'mongoose';

export type ComplaintStatus = 'open' | 'in_review' | 'resolved' | 'rejected';

export type ComplaintCategory = 'car' | 'payment' | 'app' | 'behavior' | 'other';

export type ComplaintPriority = 'low' | 'medium' | 'high';

export interface IComplaint extends Document<Types.ObjectId> {
  _id: Types.ObjectId;
  bookingId: string;
  raisedBy: Types.ObjectId;
  raisedByRole: 'customer' | 'carOwner';
  title: string;
  description: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  adminResponse?: string;
  resolvedAt?: Date;
  complaintProof?: string;
  createdAt: Date;
  updatedAt: Date;
}

const complaintSchema = new Schema<IComplaint>(
  {
    bookingId: {
      type: String,
      ref: 'Booking',
      required: true,
    },

    raisedBy: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    raisedByRole: {
      type: String,
      enum: ['customer', 'carOwner'],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    complaintProof: {
      type: String,
    },

    category: {
      type: String,
      enum: ['car', 'payment', 'app', 'behavior', 'other'],
      required: true,
    },

    status: {
      type: String,
      enum: ['open', 'in_review', 'resolved', 'rejected'],
      default: 'open',
    },

    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },

    adminResponse: {
      type: String,
    },

    resolvedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const Complaint = model<IComplaint>('Complaint', complaintSchema);

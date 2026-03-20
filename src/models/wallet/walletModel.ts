// import { Schema, model, Types } from 'mongoose';

// interface IWallet {
//   userId: Types.ObjectId;
//   userType: 'Customer' | 'CarOwner';
//   balance: number;
//   transactions: ITransaction[];
//   createdAt?: Date;
//   updatedAt?: Date;
// }

// interface ITransaction {
//   transactionId: string;
//   type: 'refund' | 'payment' | 'cancellation' | 'other' | 'credit';
//   amount: number;
//   date: Date;
//   description?: string;
// }

// const WalletSchema = new Schema<IWallet>(
//   {

//     userId: {
//       type: Schema.Types.ObjectId,
//       required: true,
//       refPath: 'userType',
//     },
//     userType: {
//       type: String,
//       required: true,
//       enum: ['Customer', 'CarOwner'],
//     },
//     balance: {
//       type: Number,
//       required: true,
//       default: 0,
//     },
//     transactions: [
//       {
//         transactionId: {
//           type: String,
//         },
//         type: {
//           type: String,
//           required: true,
//         },
//         amount: {
//           type: Number,
//           required: true,
//         },
//         date: {
//           type: Date,
//           default: Date.now,
//         },
//         description: {
//           type: String,
//         },
//       },
//     ],
//   },
//   { timestamps: true }
// );

// const Wallet = model<IWallet>('Wallet', WalletSchema);

// export { Wallet, IWallet };

import { Schema, model, Types, Document } from 'mongoose';

export type TransactionType =
  | 'payment' // Customer payment for booking
  | 'refund' // Refund to customer
  | 'cancellation' // Booking cancellation
  | 'credit' // Owner earning after trip
  | 'payout' // Money transferred to owner's bank
  | 'adjustment'; // Admin manual adjustment

export interface ITransaction {
  transactionId: string;
  type: TransactionType;
  amount: number;
  bookingId?: Types.ObjectId;
  description?: string;
  status?: 'pending' | 'completed' | 'failed';
  date: Date;
}

export interface IWallet extends Document {
  userId: Types.ObjectId;
  userType: 'Customer' | 'CarOwner' | 'Admin';

  balance: number;
  pendingPayout: number;
  totalWithdrawn: number;

  currency: string;

  transactions: ITransaction[];

  createdAt?: Date;
  updatedAt?: Date;
  // payoutEnabled?:boolean;
}

const TransactionSchema = new Schema<ITransaction>({
  transactionId: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    required: true,
    enum: ['payment', 'refund', 'cancellation', 'credit', 'payout', 'adjustment'],
  },

  amount: {
    type: Number,
    required: true,
  },

  bookingId: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
  },

  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed',
  },

  description: {
    type: String,
  },

  date: {
    type: Date,
    default: Date.now,
  },
});

const WalletSchema = new Schema<IWallet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'userType',
    },

    userType: {
      type: String,
      required: true,
      enum: ['Customer', 'CarOwner', 'Admin'],
    },

    balance: {
      type: Number,
      default: 0,
    },

    pendingPayout: {
      type: Number,
      default: 0,
    },

    totalWithdrawn: {
      type: Number,
      default: 0,
    },

    currency: {
      type: String,
      default: 'INR',
    },
    // payoutEnabled:{
    //   type:Boolean,
    //   default:false,
    // },

    transactions: [TransactionSchema],
  },
  {
    timestamps: true,
  }
);

WalletSchema.index({ userId: 1, userType: 1 }, { unique: true });

const Wallet = model<IWallet>('Wallet', WalletSchema);

export { Wallet };

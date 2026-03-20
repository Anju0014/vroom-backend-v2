// export interface TransactionDTO {
//   type: string;
//   amount: number;
//   date: Date;
//   description?: string;
// }

export interface TransactionDTO {
  transactionId: string;
  type: string;
  amount: number;
  date: Date;
  description?: string;
  bookingId?: string;
  status?: 'pending' | 'completed' | 'paid';
}

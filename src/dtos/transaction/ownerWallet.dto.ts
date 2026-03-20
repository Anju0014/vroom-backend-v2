import { TransactionDTO } from '@dtos/transaction/transaction.dto';

export interface OwnerWalletDTO {
  balance: number;
  pendingBalance: number;
  totalEarnings: number;
  totalWithdrawn: number;
  //   payoutEnabled: boolean;
  lastPayout: number;
  transactions: TransactionDTO[];
}

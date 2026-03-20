import { TransactionDTO } from '@dtos/transaction/transaction.dto';

export interface CustomerWalletDTO {
  balance: number;
  transactions: TransactionDTO[];
}

import { CustomerWalletDTO } from '@dtos/transaction/customerWallet.dto';
import { TransactionDTO } from '@dtos/transaction/transaction.dto';

export class CustomerWalletMapper {
  static toDTO(wallet: any): CustomerWalletDTO {
    return {
      balance: wallet.balance,
      // transactions: wallet.transactions.map(
      //   (txn: any): TransactionDTO => ({
      //     type: txn.type,
      //     amount: txn.amount,
      //     date: txn.date,
      //     description: txn.description,
      //     bookingId: txn.bookingId,
      //     status: txn.status,
      //   })
      // ),
      transactions: wallet.transactions.map(
        (txn: any): TransactionDTO => ({
          transactionId: txn.transactionId,
          type: txn.type,
          amount: txn.amount,
          date: txn.date,
          description: txn.description,
          bookingId: txn.bookingId,
          status: txn.status,
        })
      ),
    };
  }
}

import { OwnerWalletDTO } from '@dtos/transaction/ownerWallet.dto';
import { TransactionDTO } from '@dtos/transaction/transaction.dto';

export class OwnerWalletMapper {
  static toDTO(wallet: any): OwnerWalletDTO {
    const totalEarnings = wallet.transactions
      .filter((txn: any) => txn.type === 'credit')
      .reduce((sum: number, txn: any) => sum + txn.amount, 0);

    return {
      balance: wallet.balance || 0,

      pendingBalance: wallet.pendingPayout || 0,

      totalEarnings: totalEarnings,

      totalWithdrawn: wallet.totalWithdrawn || 0,

      //   payoutEnabled: wallet.payoutEnabled ?? false,

      lastPayout: wallet.lastPayout || 0,

      transactions: wallet.transactions
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map(
          (txn: any): TransactionDTO => ({
            transactionId: txn.transactionId,
            type: txn.type,
            amount: txn.amount,
            date: txn.date,
            description: txn.description,
            bookingId: txn.bookingId?.toString(),
            status: txn.status,
          })
        ),
    };
  }
}

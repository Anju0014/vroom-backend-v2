import { IWallet, Wallet } from '@models/wallet/walletModel';
import { BaseRepository } from '@repositories/base/BaseRepository';
import IWalletRepository from '@repositories/interfaces/wallet/IWalletRepository';

export class WalletRepository extends BaseRepository<IWallet> implements IWalletRepository {
  constructor() {
    super(Wallet);
  }

  async findWalletByUserId(userId: string): Promise<IWallet | null> {
    return await Wallet.findOne({ userId });
  }

  async createWallet(
    userId: string,
    userType: 'Customer' | 'CarOwner' | 'Admin'
  ): Promise<IWallet> {
    const wallet = new Wallet({
      userId,
      userType,
      balance: 0,
      pendingPayout: 0,
      totalWithdrawn: 0,
      currency: 'INR',
      transactions: [],
    });

    return await wallet.save();
  }

  async saveWallet(wallet: IWallet): Promise<IWallet> {
    return await wallet.save();
  }
}
export default WalletRepository;

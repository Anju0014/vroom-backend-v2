import { IWallet } from '@models/wallet/walletModel';
interface IWalletRepository {
  findWalletByUserId(userId: string): Promise<IWallet | null>;
  createWallet(userId: string, userType: 'Customer' | 'CarOwner' | 'Admin'): Promise<IWallet>;
  saveWallet(wallet: IWallet): Promise<IWallet>;
}
export default IWalletRepository;

import { IBooking } from '@models/booking/bookingModel';
import { IWallet } from '@models/wallet/walletModel';

interface ICustomerDashBoardRepository {
  findBookingsByUserId(userId: string, page: number, limit: number): Promise<any>;
  bookingsByUserCount(userId: string): Promise<number>;
  findBookingById(bookingId: string): Promise<IBooking | null>;
  saveBooking(bookingData: IBooking): Promise<IBooking>;
  logWalletTransaction(
    userId: string,
    type: string,
    amount: number,
    description: string
  ): Promise<void>;
  createWallet(userId: string): Promise<IWallet | null>;
  findWalletByUserId(userId: string): Promise<IWallet | null>;
  saveWallet(wallet: IWallet): Promise<IWallet | null>;
  findWalletByUserWithTransactions(userId: string, page: number, limit: number): Promise<any>;
  getTransactionCount(userId: string): Promise<number>;
}

export default ICustomerDashBoardRepository;

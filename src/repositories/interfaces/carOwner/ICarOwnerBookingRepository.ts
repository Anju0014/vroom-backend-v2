import { IBooking } from '@models/booking/bookingModel';
import { IWallet } from '@models/wallet/walletModel';

interface ICarOwnerBookingRepository {
  getBookingsForCarOwner(
    carOwnerId: string,
    page: number,
    limit: number,
    search: string,
    status: string
  ): Promise<{ bookings: IBooking[]; total: number }>;

  markCarReturned(bookingId: string): Promise<IBooking | null>;
  createWallet(userId: string): Promise<IWallet | null>;
  findWalletByUserId(userId: string): Promise<IWallet | null>;
  saveWallet(wallet: IWallet): Promise<IWallet | null>;
  countCars(carOwnerId: string): Promise<number>;
  countBookings(carOwnerId: string): Promise<number>;
  countActiveBookings(carOwnerId: string): Promise<number>;
  getEarnings(carOwnerId: string, startDate: Date): Promise<any>;
  getCarStats(carOwnerId: string): Promise<any>;
  findWalletByUserWithTransactions(userId: string, page: number, limit: number): Promise<any>;
  getTransactionCount(userId: string): Promise<number>;
  getPayoutStatus(userId: string): Promise<boolean>;
}
export default ICarOwnerBookingRepository;

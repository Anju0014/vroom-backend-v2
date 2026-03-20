import { Stats } from '@app-types/stats';
import { IBooking } from '@models/booking/bookingModel';

export interface ICarOwnerBookingService {
  getBookingsForCarOwner(
    carOwnerId: string,
    page: number,
    limit: number,
    search: string,
    status: string
  ): Promise<{ bookings: IBooking[]; total: number }>;

  markCarReceived(bookingId: string): Promise<IBooking>;
  getOwnerStats(carOwnerId: string, range: string): Promise<Stats>;
  getOwnerWallet(userId: string, page: number, limit: number): Promise<any[]>;
  getOwnerWalletTransactionCount(userId: string): Promise<number>;
  getPayoutStatus(userId: string): Promise<boolean>;
}

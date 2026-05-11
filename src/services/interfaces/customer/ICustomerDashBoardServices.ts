import { CustomerBookingDTO } from '@dtos/customer/customerBooking.dto';
import { CustomerWalletDTO } from '@dtos/transaction/customerWallet.dto';
import { IBooking } from '@models/booking/bookingModel';

export interface ICustomerDashBoardService {
  getCustomerBookings(userId: string, page: number, limit: number): Promise<CustomerBookingDTO[]>;
  getCustomerBookingCount(userId: string): Promise<number>;
  getCustomerWallet(userId: string, page: number, limit: number): Promise<CustomerWalletDTO>;
  getCustomerWalletTransactionCount(userId: string): Promise<number>;
  cancelBooking(bookingId: string): Promise<IBooking>;
}

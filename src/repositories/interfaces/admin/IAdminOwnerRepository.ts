import { ICar } from '@models/car/carModel';
import { ICarOwner } from '@models/carowner/carOwnerModel';
import { IBooking } from '@models/booking/bookingModel';
import { ICarPopulated } from '@models/car/carTypesModel';
import { IWallet } from '@models/wallet/walletModel';

interface IAdminOwnerRepository {
  getAllOwnerforVerify(
    page: number,
    limit: number,
    search: string
  ): Promise<{ carOwners: ICarOwner[]; total: number }>;
  getAllCarsforVerify(
    page: number,
    limit: number,
    search: string
  ): Promise<{ cars: ICarPopulated[]; total: number }>;
  findCarOwnerById(ownerId: string): Promise<ICarOwner | null>;
  updateOwnerStatus(ownerId: string, updateData: Partial<ICarOwner>): Promise<ICarOwner | null>;
  findCarById(carId: string): Promise<ICar | null>;
  updateCarStatus(carId: string, verifyDetails: Partial<ICar>): Promise<ICar | null>;
  getAllVerifiedCars(
    page: number,
    limit: number,
    search: string
  ): Promise<{ cars: ICarPopulated[]; total: number }>;
  getAllBookings(
    page: number,
    limit: number,
    search: string
  ): Promise<{ bookings: IBooking[]; total: number }>;
  countCustomers(): Promise<number>;
  countOwners(): Promise<number>;
  countCars(): Promise<number>;
  countBookings(): Promise<number>;
  countActiveBookings(): Promise<number>;
  getTotalPlatformRevenue(): Promise<number>;
  getEarnings(startDate: Date): Promise<any>;
  getCarStats(): Promise<any>;
  getOwnerWallets(): Promise<IWallet[] | null>;
  getWalletByOwnerId(ownerId: string): Promise<IWallet | null>;
  savewallet(wallet: any): Promise<void>;
}
export default IAdminOwnerRepository;

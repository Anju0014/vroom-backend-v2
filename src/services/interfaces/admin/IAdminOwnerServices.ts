import { ICarOwner } from '@models/carowner/carOwnerModel';
import { ICar } from '@models/car/carModel';
import { IBooking } from '@models/booking/bookingModel';
import { ICarPopulated } from '@models/car/carTypesModel';
import { Stats } from '@app-types/stats';
import { IWallet } from '@models/wallet/walletModel';

export interface IAdminOwnerService {
  listAllOwnerforVerify(
    page: number,
    limit: number,
    search: string
  ): Promise<{ carOwners: ICarOwner[]; total: number }>;
  listAllCarsforVerify(
    page: number,
    limit: number,
    search: string
  ): Promise<{ cars: ICarPopulated[]; total: number }>;
  listAllVerifiedCars(
    page: number,
    limit: number,
    search: string
  ): Promise<{ cars: ICarPopulated[]; total: number }>;
  listAllBookings(
    page: number,
    limit: number,
    search: string
  ): Promise<{ bookings: IBooking[]; total: number }>;

  updateOwnerVerifyStatus(ownerId: string, verifyDetails: Partial<ICarOwner>): Promise<ICarOwner>;
  updateOwnerBlockStatus(ownerId: string, newStatus: number): Promise<ICarOwner>;
  updateCarBlockStatus(carId: string, newStatus: number): Promise<ICar>;
  updateCarVerifyStatus(carId: string, verifyDetails: Partial<ICar>): Promise<ICar>;
  getAdminStats(range: string): Promise<Stats>;
  getOwnerWallets(): Promise<IWallet[] | null>;
  payoutOwner(ownerId: string, amount: number): Promise<{ wallet: IWallet; transferId: string }>;
}

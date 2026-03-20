export interface BookingData {
  bookingId: string;
  carId: string;
  userId: string;
  carOwnerId: string;
  startDate: string | Date;
  endDate: string | Date;
  totalPrice: number;
  status: 'confirmed' | 'pending' | 'cancelled' | ' failed';
  paymentIntentId?: string;
  paymentMethod?: 'stripe' | 'wallet';
  lockedUntil?: Date;
}
export interface BookingUserData {
  id: string;
  carId: string;
  carName: string;
  brand: string;
  userId: string;
  carOwnerId: string;
  ownerName: string;
  ownerContact: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  pickupLocation: string;
  carNumber: string;
  lockedUntil?: Date;
}

export interface UpdateTrackingProps {
  bookingId: string;
  token: string;
  lat: number;
  lng: number;
}

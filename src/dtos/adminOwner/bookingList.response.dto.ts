export interface BookingListItemDTO {
  id: string;
  bookingId: string;
  customerId: string;
  carId: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: string | number;
  createdAt?: Date;
}

export interface BookingListResponseDTO {
  bookings: BookingListItemDTO[];
  total: number;
}

export interface BookingListDetailItemDTO {
  id: string;
  bookingId: string;

  startDate: Date;
  endDate: Date;
  status: string;
  totalPrice: number;
  createdAt: Date;

  customer: {
    id: string;
    fullName: string;
    email: string;
  };

  carOwner: {
    id: string;
    fullName: string;
    email: string;
  };

  car: {
    id: string;
    carName: string;
    brand: string;
    model: string;
  };
}

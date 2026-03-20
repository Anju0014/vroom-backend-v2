export interface CarVerifyListItemDTO {
  id: string;
  carName: string;
  ownerId: string;
  verifyStatus: number;
  blockStatus: number;
  rejectionReason?: string;
  createdAt?: Date;
}

export interface CarVerifyListResponseDTO {
  cars: CarVerifyListItemDTO[];
  total: number;
}

export interface CarVerifyDTO {
  id: string;
  carName: string;
  brand: string;
  year?: string;
  fuelType?: string;
  carType?: string;
  expectedWage: number;

  rcBookNo?: string;
  rcBookProof?: string;
  insuranceProof?: string;

  images: string[];
  videos?: string[];

  owner: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
  };

  verifyStatus: number;
  blockStatus: number;
  available?: boolean;
  unavailableDates: Date[];
  location?: {
    address: string;
    landmark: string;
    coordinates: {
      type: 'Point';
      coordinates: [number, number];
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

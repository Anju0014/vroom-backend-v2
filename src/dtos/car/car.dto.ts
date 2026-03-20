export interface CarDTO {
  id: string;

  carName: string;
  brand: string;
  year?: number;
  fuelType?: string;
  carType?: string;

  rcBookNo?: string;
  expectedWage: number;

  verifyStatus?: number;
  blockStatus?: number;
  available?: boolean;
  isDeleted?: boolean;

  location: {
    address: string;
    landmark?: string;
    coordinates: [number, number];
  };

  images: string[];
  videos: string[];

  rcBookProof: string;
  insuranceProof: string;

  unavailableDates?: Date[];

  ownerId: string;

  createdAt: Date;
  updatedAt: Date;
}

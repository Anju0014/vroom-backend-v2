export interface CustomerCarDTO {
  id: string;
  carName: string;
  brand: string;
  year: number;
  fuelType: string;
  carType: string;
  expectedWage: number;
  rcBookNo: string;
  verifyStatus: number;
  isDeleted: boolean | undefined;
  available: boolean | undefined;
  location: {
    address: string;
    landmark?: string;
    coordinates: [number, number];
  };
  images: string[];
  rating?: number;
}

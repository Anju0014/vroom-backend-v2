export interface RegisterCarRequestDTO {
  carName: string;
  brand: string;
  pricePerDay: number;
  images?: string[];
  videos?: string[];
}

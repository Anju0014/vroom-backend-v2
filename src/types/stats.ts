export interface Stats {
  totalCars: number;
  totalCustomers?: number;
  totalCarOwners?: number;
  totalBookings: number;
  activeRentals: number;

  earnings?: {
    date: string;
    amount: number;
  }[];
  carStats?: {
    available: number;
    verified: number;
    booked: number;
    maintenance: number;
  };
  totalRevenue?: number;
  // activeRentals?: number;
  // monthlyRevenue?: { month: string; revenue: number }[];
}

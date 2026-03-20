export interface RaisedByUserDTO {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: 'customer' | 'carOwner';
}

export interface ComplaintAdminResponseDTO {
  _id: string;
  bookingId: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  adminResponse?: string;
  resolvedAt?: Date;
  createdAt: Date;
  complaintProof?: string;
  raisedByRole: 'customer' | 'carOwner';
  raisedByUser: RaisedByUserDTO | null;
}

export interface CreateComplaintDTO {
  bookingId: string;
  title: string;
  description: string;
  category: 'car' | 'payment' | 'app' | 'behavior' | 'other';
  complaintProof: string;
}

export interface UpdateComplaintByAdminDTO {
  status: 'open' | 'in_review' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  adminResponse?: string;
}

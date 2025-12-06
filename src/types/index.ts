// User Types
export type UserRole = "student" | "mentor" | "admin";

// Admin Types (for MYM-9: View Pending Applications)
export interface PendingApplication {
  id: string
  name: string | null
  email: string
  created_at: string
  specialties: string[] | null
  linkedin_url: string | null
  github_url: string | null
}

// MYM-10: Application Detail (extends PendingApplication for detail view)
export interface ApplicationDetail extends PendingApplication {
  description: string | null
  photo_url: string | null
  hourly_rate: number | null
  is_verified: boolean
  years_of_experience: number | null
  average_rating: number | null
  total_reviews: number | null
  rejection_reason?: string | null  // MYM-11: Added for rejected status display
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  photoUrl?: string;
  description?: string;
  createdAt: Date;
}

// Mentor Types
export interface MentorProfile {
  userId: string;
  specialties: string[];
  hourlyRate: number;
  linkedinUrl?: string;
  githubUrl?: string;
  isVerified: boolean;
  averageRating: number;
  totalReviews: number;
  yearsOfExperience?: number;
}

export interface Mentor extends User {
  role: "mentor";
  profile: MentorProfile;
}

// Student Types
export interface StudentProfile {
  userId: string;
  skills?: string[];
  learningGoals?: string[];
}

export interface Student extends User {
  role: "student";
  profile?: StudentProfile;
}

// Booking Types
export type BookingStatus =
  | "provisional"
  | "pending_payment"
  | "confirmed"
  | "completed"
  | "cancelled";

export interface Booking {
  id: string;
  studentId: string;
  mentorId: string;
  sessionDate: Date;
  durationMinutes: number;
  totalCost: number;
  status: BookingStatus;
  videocallUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Review Types
export interface Review {
  id: string;
  bookingId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
}

// Mock Auth Types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData extends LoginCredentials {
  name: string;
  role: UserRole;
}

// MYM-11: Verification Actions (Approve/Reject Mentor Application)
export type VerificationAction = 'approve' | 'reject'

export interface VerificationPayload {
  applicationId: string
  action: VerificationAction
  reason?: string  // Required if action is 'reject'
}

export interface VerificationResult {
  success: boolean
  error?: string
  updatedAt?: string
}

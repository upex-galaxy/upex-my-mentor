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

// MYM-35: View Profile Reviews - Extended types for display
export interface ReviewWithReviewer {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer: {
    name: string | null;
  } | null;
}

export interface RatingDistribution {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

export type ReviewSortOption = 'recent' | 'highest' | 'lowest';
export type ReviewFilterOption = 'all' | '5' | '4' | '3' | '2' | '1';

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

// MYM-22: Email Confirmation and Calendar Invite - Re-export scheduling types
export type {
  BookingConfirmationData,
  CalendarEventData,
  EmailSendResult,
  BookingConfirmationEmailProps,
  EmailData,
  BookingConfirmationRequest,
  BookingConfirmationResponse,
} from './scheduling'

// MYM-34: Mentor Review Mentee - Review submission types
export interface ReviewSubmission {
  booking_id: string;
  subject_id: string;  // The reviewee (mentee in MYM-34, mentor in MYM-33)
  rating: number;      // 1-5
  comment?: string;    // max 500 chars
}

// MYM-25: Stripe Connect - Payment types
export type {
  StripeAccount,
  StripeAccountInsert,
  StripeAccountUpdate,
  StripeConnectStatus,
  StripeConnectState,
  StripeConnectOnboardRequest,
  StripeConnectOnboardResponse,
  StripeConnectStatusResponse,
  PaymentAPIError,
  StripeOnboardingResult,
  PayoutsPageParams,
} from './payments'

export { getConnectState, STRIPE_CONNECT_MESSAGES } from './payments'

// MYM-30: Session Management types
export type {
  BookingRow,
  BookingInsert,
  BookingUpdate,
  ParticipantInfo,
  BookingWithParticipants,
  SessionTab,
  SessionFilters,
  VideoLinkErrorCode,
  VideoLinkSuccessResponse,
  VideoLinkErrorResponse,
  VideoLinkResponse,
  SessionDisplayStatus,
} from './sessions'

export { getSessionDisplayStatus } from './sessions'

export type ReviewEligibilityReason =
  | 'not_authenticated'
  | 'booking_not_found'
  | 'not_participant'
  | 'not_completed'
  | 'too_early'
  | 'already_reviewed';

export interface ReviewEligibility {
  canReview: boolean;
  reason?: ReviewEligibilityReason;
  booking?: BookingForReview;
}

export interface BookingForReview {
  id: string;
  mentor_id: string;
  student_id: string;
  mentor_name: string | null;
  student_name: string | null;
  session_date: string;
  duration_minutes: number;
  status: string;
}

// MYM-56: Messaging types
export type {
  ConversationRow,
  ConversationInsert,
  ConversationUpdate,
  MessageRow,
  MessageInsert,
  MessageUpdate,
  ConversationParticipant,
  ConversationWithDetails,
  MessageWithSender,
  SendMessageRequest,
  SendMessageResponse,
  ConversationCheck,
  SendMessageButtonProps,
  MessageComposerModalProps,
  // MYM-57: Component props for conversation history
  ConversationListProps,
  ConversationListItemProps,
  ConversationThreadProps,
  MessageBubbleProps,
  EmptyConversationsProps,
} from './messaging'

export { MIN_MESSAGE_LENGTH, MAX_MESSAGE_LENGTH } from './messaging'

// MYM-58: Notification types
export type {
  NotificationContextValue,
  NewMessagePayload,
  NewMessageWithSenderPayload,
  NotificationBadgeProps,
} from './messaging'

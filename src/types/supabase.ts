export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          cancellation_reason: string | null  // MYM-31: Optional reason for cancellation
          cancelled_at: string | null  // MYM-31: Timestamp when cancelled
          cancelled_by: string | null  // MYM-31: User who initiated cancellation
          communication_channels: Json | null  // MYM-30: Agreed communication channels for the session
          completed_at: string | null  // MYM-27: Session completion timestamp for 24h payout grace period
          confirmation_sent_at: string | null  // MYM-22: Email confirmation timestamp
          created_at: string | null
          duration_minutes: number
          id: string
          mentor_id: string
          notes: string | null
          session_date: string
          session_meeting_link: string | null  // MYM-30: Mentor-provided meeting link for the session
          status: string
          student_id: string
          total_cost: number
          updated_at: string | null
          videocall_url: string | null
        }
        Insert: {
          cancellation_reason?: string | null  // MYM-31: Optional reason for cancellation
          cancelled_at?: string | null  // MYM-31: Timestamp when cancelled
          cancelled_by?: string | null  // MYM-31: User who initiated cancellation
          communication_channels?: Json | null  // MYM-30: Agreed communication channels
          completed_at?: string | null  // MYM-27: Session completion timestamp
          confirmation_sent_at?: string | null  // MYM-22: Email confirmation timestamp
          created_at?: string | null
          duration_minutes?: number
          id?: string
          mentor_id: string
          notes?: string | null
          session_date: string
          session_meeting_link?: string | null  // MYM-30: Mentor-provided meeting link
          status?: string
          student_id: string
          total_cost: number
          updated_at?: string | null
          videocall_url?: string | null
        }
        Update: {
          cancellation_reason?: string | null  // MYM-31: Optional reason for cancellation
          cancelled_at?: string | null  // MYM-31: Timestamp when cancelled
          cancelled_by?: string | null  // MYM-31: User who initiated cancellation
          communication_channels?: Json | null  // MYM-30: Agreed communication channels
          completed_at?: string | null  // MYM-27: Session completion timestamp
          confirmation_sent_at?: string | null  // MYM-22: Email confirmation timestamp
          created_at?: string | null
          duration_minutes?: number
          id?: string
          mentor_id?: string
          notes?: string | null
          session_date?: string
          session_meeting_link?: string | null  // MYM-30: Mentor-provided meeting link
          status?: string
          student_id?: string
          total_cost?: number
          updated_at?: string | null
          videocall_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      // MYM-30: Communication channel preferences for mentors
      communication_channels: {
        Row: {
          channel_type: string
          created_at: string | null
          handle: string | null
          id: string
          is_active: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          channel_type: string
          created_at?: string | null
          handle?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          channel_type?: string
          created_at?: string | null
          handle?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_channels_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          average_rating: number | null
          created_at: string | null
          description: string | null
          email: string
          github_url: string | null
          hourly_rate: number | null
          id: string
          is_verified: boolean | null
          linkedin_url: string | null
          name: string | null
          photo_url: string | null
          rejection_reason: string | null
          role: Database["public"]["Enums"]["user_role"]
          specialties: string[] | null
          total_reviews: number | null
          updated_at: string | null
          years_of_experience: number | null
        }
        Insert: {
          average_rating?: number | null
          created_at?: string | null
          description?: string | null
          email: string
          github_url?: string | null
          hourly_rate?: number | null
          id: string
          is_verified?: boolean | null
          linkedin_url?: string | null
          name?: string | null
          photo_url?: string | null
          rejection_reason?: string | null
          role: Database["public"]["Enums"]["user_role"]
          specialties?: string[] | null
          total_reviews?: number | null
          updated_at?: string | null
          years_of_experience?: number | null
        }
        Update: {
          average_rating?: number | null
          created_at?: string | null
          description?: string | null
          email?: string
          github_url?: string | null
          hourly_rate?: number | null
          id?: string
          is_verified?: boolean | null
          linkedin_url?: string | null
          name?: string | null
          photo_url?: string | null
          rejection_reason?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          specialties?: string[] | null
          total_reviews?: number | null
          updated_at?: string | null
          years_of_experience?: number | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string | null
          comment: string | null
          created_at: string | null
          id: string
          rating: number
          reviewer_id: string
          subject_id: string
        }
        Insert: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          rating: number
          reviewer_id: string
          subject_id: string
        }
        Update: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          reviewer_id?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_reviewer"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_subject"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      // MYM-25: Stripe Connect accounts for mentor payouts
      stripe_accounts: {
        Row: {
          charges_enabled: boolean | null
          created_at: string | null
          id: string
          mentor_id: string
          onboarding_complete: boolean | null
          payouts_enabled: boolean | null
          stripe_account_id: string
          updated_at: string | null
        }
        Insert: {
          charges_enabled?: boolean | null
          created_at?: string | null
          id?: string
          mentor_id: string
          onboarding_complete?: boolean | null
          payouts_enabled?: boolean | null
          stripe_account_id: string
          updated_at?: string | null
        }
        Update: {
          charges_enabled?: boolean | null
          created_at?: string | null
          id?: string
          mentor_id?: string
          onboarding_complete?: boolean | null
          payouts_enabled?: boolean | null
          stripe_account_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stripe_accounts_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      // MYM-24: Payment transaction records
      transactions: {
        Row: {
          id: string
          booking_id: string
          stripe_payment_intent_id: string | null
          stripe_checkout_session_id: string | null
          mentee_id: string
          mentor_id: string
          gross_amount: number
          platform_fee: number
          net_amount: number
          currency: string
          status: string
          payment_method: string | null
          paid_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          booking_id: string
          stripe_payment_intent_id?: string | null
          stripe_checkout_session_id?: string | null
          mentee_id: string
          mentor_id: string
          gross_amount: number
          platform_fee: number
          net_amount: number
          currency?: string
          status?: string
          payment_method?: string | null
          paid_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          booking_id?: string
          stripe_payment_intent_id?: string | null
          stripe_checkout_session_id?: string | null
          mentee_id?: string
          mentor_id?: string
          gross_amount?: number
          platform_fee?: number
          net_amount?: number
          currency?: string
          status?: string
          payment_method?: string | null
          paid_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_mentee_id_fkey"
            columns: ["mentee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      // MYM-27: Payout records for mentor earnings
      payouts: {
        Row: {
          id: string
          mentor_id: string
          stripe_transfer_id: string | null
          amount: number
          currency: string
          status: string
          failure_reason: string | null
          scheduled_for: string | null
          processed_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          mentor_id: string
          stripe_transfer_id?: string | null
          amount: number
          currency?: string
          status?: string
          failure_reason?: string | null
          scheduled_for?: string | null
          processed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          mentor_id?: string
          stripe_transfer_id?: string | null
          amount?: number
          currency?: string
          status?: string
          failure_reason?: string | null
          scheduled_for?: string | null
          processed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payouts_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      // MYM-27: Links payouts to transactions (prevents duplicate payouts)
      payout_items: {
        Row: {
          id: string
          payout_id: string
          transaction_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          payout_id: string
          transaction_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          payout_id?: string
          transaction_id?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payout_items_payout_id_fkey"
            columns: ["payout_id"]
            isOneToOne: false
            referencedRelation: "payouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payout_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: true
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      // MYM-27: Failed payout attempts for admin reconciliation
      failed_payouts: {
        Row: {
          id: string
          booking_id: string
          transaction_id: string | null
          mentor_id: string
          reason: string
          error_details: Json | null
          resolved_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          booking_id: string
          transaction_id?: string | null
          mentor_id: string
          reason: string
          error_details?: Json | null
          resolved_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          booking_id?: string
          transaction_id?: string | null
          mentor_id?: string
          reason?: string
          error_details?: Json | null
          resolved_at?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "failed_payouts_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "failed_payouts_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "failed_payouts_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      // MYM-21: Mentor weekly availability schedule
      mentor_availability: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean
          mentor_id: string
          start_time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean
          mentor_id: string
          start_time: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean
          mentor_id?: string
          start_time?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentor_availability_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_all_unique_skills: { Args: never; Returns: string[] }
      is_admin: { Args: never; Returns: boolean }
      // MYM-15: Search mentors by keyword across name, bio, and specialties
      search_mentors_by_keyword: {
        Args: { search_keyword: string }
        Returns: Database['public']['Tables']['profiles']['Row'][]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      user_role: "student" | "mentor" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["student", "mentor", "admin"],
    },
  },
} as const

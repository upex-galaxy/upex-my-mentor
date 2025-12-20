// Generated types for Supabase database
// Based on backend-setup.md documentation

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          role: 'student' | 'mentor'
          specialties?: string[]
          hourly_rate?: number
          bio?: string
          avatar_url?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role?: 'student' | 'mentor'
          specialties?: string[]
          hourly_rate?: number
          bio?: string
          avatar_url?: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      reviews: {
        Row: {
          id: string
          reviewer_id: string
          subject_id: string
          rating: number
          comment: string
          created_at: string
          updated_at: string
        }
        Insert: {
          reviewer_id: string
          subject_id: string
          rating: number
          comment: string
        }
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>
      }
      conversations: {
        Row: {
          id: string
          participant_1_id: string
          participant_2_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          participant_1_id: string
          participant_2_id: string
        }
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          is_read: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          conversation_id: string
          sender_id: string
          content: string
          is_read?: boolean
        }
        Update: Partial<Database['public']['Tables']['messages']['Insert']>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_all_unique_skills: () => string[]
      mark_messages_as_read: (p_conversation_id: string, p_user_id: string) => number
    }
    Enums: {
      [_ in never]: never
    }
  }
}
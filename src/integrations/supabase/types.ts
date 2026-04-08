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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      academies: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          stripe_customer_id: string | null
          subscription_status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          stripe_customer_id?: string | null
          subscription_status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          stripe_customer_id?: string | null
          subscription_status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      academy_invitations: {
        Row: {
          academy_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          status: string
        }
        Insert: {
          academy_id: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          status?: string
        }
        Update: {
          academy_id?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_invitations_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          excerpt: string | null
          id: string
          published: boolean
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      client_lessons: {
        Row: {
          academy_id: string | null
          client_id: string
          coach_id: string
          completed_date: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          exercises: Json
          id: string
          objectives: string | null
          scheduled_date: string | null
          session_id: string | null
          status: string
          template_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          academy_id?: string | null
          client_id: string
          coach_id: string
          completed_date?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          exercises?: Json
          id?: string
          objectives?: string | null
          scheduled_date?: string | null
          session_id?: string | null
          status?: string
          template_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          academy_id?: string | null
          client_id?: string
          coach_id?: string
          completed_date?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          exercises?: Json
          id?: string
          objectives?: string | null
          scheduled_date?: string | null
          session_id?: string | null
          status?: string
          template_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_lessons_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_lessons_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_lessons_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_lessons_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_lessons_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "lesson_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      client_videos: {
        Row: {
          client_id: string
          coach_id: string
          created_at: string
          description: string | null
          duration_seconds: number | null
          file_size: number | null
          id: string
          title: string
          updated_at: string
          video_url: string
        }
        Insert: {
          client_id: string
          coach_id: string
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          file_size?: number | null
          id?: string
          title: string
          updated_at?: string
          video_url: string
        }
        Update: {
          client_id?: string
          coach_id?: string
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          file_size?: number | null
          id?: string
          title?: string
          updated_at?: string
          video_url?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          academy_id: string | null
          coach_id: string
          created_at: string
          email: string | null
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          skill_level: string | null
          status: string
          updated_at: string
        }
        Insert: {
          academy_id?: string | null
          coach_id: string
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          skill_level?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          academy_id?: string | null
          coach_id?: string
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          skill_level?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      instruction_videos: {
        Row: {
          academy_id: string | null
          coach_id: string
          created_at: string
          description: string | null
          duration_seconds: number | null
          file_size: number | null
          id: string
          tags: string[] | null
          title: string
          updated_at: string
          video_url: string
        }
        Insert: {
          academy_id?: string | null
          coach_id: string
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          file_size?: number | null
          id?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          video_url: string
        }
        Update: {
          academy_id?: string | null
          coach_id?: string
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          file_size?: number | null
          id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "instruction_videos_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_templates: {
        Row: {
          academy_id: string | null
          coach_id: string
          created_at: string
          description: string | null
          duration_minutes: number | null
          exercises: Json
          id: string
          objectives: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          academy_id?: string | null
          coach_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          exercises?: Json
          id?: string
          objectives?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          academy_id?: string | null
          coach_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          exercises?: Json
          id?: string
          objectives?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_templates_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          academy_id: string | null
          amount: number
          client_id: string
          coach_id: string
          created_at: string
          currency: string
          description: string | null
          id: string
          payment_date: string | null
          payment_status: string
          payment_type: string
          sessions_covered: number | null
          sessions_remaining: number | null
          updated_at: string
        }
        Insert: {
          academy_id?: string | null
          amount: number
          client_id: string
          coach_id: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          payment_date?: string | null
          payment_status?: string
          payment_type: string
          sessions_covered?: number | null
          sessions_remaining?: number | null
          updated_at?: string
        }
        Update: {
          academy_id?: string | null
          amount?: number
          client_id?: string
          coach_id?: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          payment_date?: string | null
          payment_status?: string
          payment_type?: string
          sessions_covered?: number | null
          sessions_remaining?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_admins: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          cal_username: string | null
          cal_webhook_enabled: boolean | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          cal_username?: string | null
          cal_webhook_enabled?: boolean | null
          created_at?: string
          email?: string | null
          full_name: string
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          cal_username?: string | null
          cal_webhook_enabled?: boolean | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      progress_notes: {
        Row: {
          academy_id: string | null
          client_id: string
          coach_id: string
          content: string
          created_at: string
          id: string
          note_date: string
          session_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          academy_id?: string | null
          client_id: string
          coach_id: string
          content: string
          created_at?: string
          id?: string
          note_date?: string
          session_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          academy_id?: string | null
          client_id?: string
          coach_id?: string
          content?: string
          created_at?: string
          id?: string
          note_date?: string
          session_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_notes_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_notes_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_notes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          academy_id: string | null
          client_id: string
          coach_id: string
          created_at: string
          duration_minutes: number
          id: string
          location: string | null
          notes: string | null
          session_date: string
          status: string
          updated_at: string
        }
        Insert: {
          academy_id?: string | null
          client_id: string
          coach_id: string
          created_at?: string
          duration_minutes?: number
          id?: string
          location?: string | null
          notes?: string | null
          session_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          academy_id?: string | null
          client_id?: string
          coach_id?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          location?: string | null
          notes?: string | null
          session_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          academy_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["academy_role"]
          user_id: string
        }
        Insert: {
          academy_id: string
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["academy_role"]
          user_id: string
        }
        Update: {
          academy_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["academy_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_academy_id_fkey"
            columns: ["academy_id"]
            isOneToOne: false
            referencedRelation: "academies"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_academy_id: { Args: { _user_id: string }; Returns: string }
      is_academy_admin: {
        Args: { _academy_id: string; _user_id: string }
        Returns: boolean
      }
      is_academy_member: {
        Args: { _academy_id: string; _user_id: string }
        Returns: boolean
      }
      is_platform_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      academy_role: "admin" | "coach"
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
      academy_role: ["admin", "coach"],
    },
  },
} as const

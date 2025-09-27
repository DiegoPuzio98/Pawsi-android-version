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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      adoption_posts: {
        Row: {
          age: string | null
          breed: string | null
          colors: string[] | null
          contact_email: string | null
          contact_phone: string | null
          contact_whatsapp: string | null
          country: string | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          location_lat: number | null
          location_lng: number | null
          location_text: string | null
          owner_secret_hash: string
          province: string | null
          species: string | null
          status: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          age?: string | null
          breed?: string | null
          colors?: string[] | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_whatsapp?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          location_lat?: number | null
          location_lng?: number | null
          location_text?: string | null
          owner_secret_hash: string
          province?: string | null
          species?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          age?: string | null
          breed?: string | null
          colors?: string[] | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_whatsapp?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          location_lat?: number | null
          location_lng?: number | null
          location_text?: string | null
          owner_secret_hash?: string
          province?: string | null
          species?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      classifieds: {
        Row: {
          category: string
          condition: string | null
          contact_email: string | null
          contact_whatsapp: string | null
          country: string | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          location_lat: number | null
          location_lng: number | null
          location_text: string | null
          price: number | null
          province: string | null
          status: string
          store_contact: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          category: string
          condition?: string | null
          contact_email?: string | null
          contact_whatsapp?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          location_lat?: number | null
          location_lng?: number | null
          location_text?: string | null
          price?: number | null
          province?: string | null
          status?: string
          store_contact?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          category?: string
          condition?: string | null
          contact_email?: string | null
          contact_whatsapp?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          location_lat?: number | null
          location_lng?: number | null
          location_text?: string | null
          price?: number | null
          province?: string | null
          status?: string
          store_contact?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      deletion_logs: {
        Row: {
          content_id: string
          content_type: string
          deleted_at: string | null
          deleted_by: string | null
          id: string
          processed: boolean | null
        }
        Insert: {
          content_id: string
          content_type: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          processed?: boolean | null
        }
        Update: {
          content_id?: string
          content_type?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          processed?: boolean | null
        }
        Relationships: []
      }
      lost_posts: {
        Row: {
          breed: string | null
          colors: string[] | null
          contact_email: string | null
          contact_phone: string | null
          contact_whatsapp: string | null
          country: string | null
          created_at: string
          description: string | null
          expires_at: string
          id: string
          images: string[] | null
          location_lat: number | null
          location_lng: number | null
          location_text: string
          lost_at: string | null
          owner_secret_hash: string
          province: string | null
          species: string | null
          status: string
          title: string
          user_id: string | null
        }
        Insert: {
          breed?: string | null
          colors?: string[] | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_whatsapp?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          expires_at?: string
          id?: string
          images?: string[] | null
          location_lat?: number | null
          location_lng?: number | null
          location_text: string
          lost_at?: string | null
          owner_secret_hash: string
          province?: string | null
          species?: string | null
          status?: string
          title: string
          user_id?: string | null
        }
        Update: {
          breed?: string | null
          colors?: string[] | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_whatsapp?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          expires_at?: string
          id?: string
          images?: string[] | null
          location_lat?: number | null
          location_lng?: number | null
          location_text?: string
          lost_at?: string | null
          owner_secret_hash?: string
          province?: string | null
          species?: string | null
          status?: string
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string | null
          post_type: string | null
          read_at: string | null
          recipient_id: string
          sender_id: string
          subject: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id?: string | null
          post_type?: string | null
          read_at?: string | null
          recipient_id: string
          sender_id: string
          subject: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string | null
          post_type?: string | null
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          meta: Json | null
          read: boolean | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          meta?: Json | null
          read?: boolean | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          meta?: Json | null
          read?: boolean | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      post_reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          post_id: string
          post_type: string
          reason: string
          reporter_user_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          post_id: string
          post_type: string
          reason: string
          reporter_user_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          post_id?: string
          post_type?: string
          reason?: string
          reporter_user_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string
          display_name: string | null
          id: string
          province: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          province?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          province?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reported_posts: {
        Row: {
          breed: string | null
          colors: string[] | null
          contact_email: string | null
          contact_phone: string | null
          contact_whatsapp: string | null
          country: string | null
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          images: string[] | null
          location_lat: number | null
          location_lng: number | null
          location_text: string
          owner_secret_hash: string | null
          province: string | null
          seen_at: string | null
          species: string | null
          state: string
          status: string
          title: string
          user_id: string | null
        }
        Insert: {
          breed?: string | null
          colors?: string[] | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_whatsapp?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          images?: string[] | null
          location_lat?: number | null
          location_lng?: number | null
          location_text: string
          owner_secret_hash?: string | null
          province?: string | null
          seen_at?: string | null
          species?: string | null
          state: string
          status?: string
          title: string
          user_id?: string | null
        }
        Update: {
          breed?: string | null
          colors?: string[] | null
          contact_email?: string | null
          contact_phone?: string | null
          contact_whatsapp?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          images?: string[] | null
          location_lat?: number | null
          location_lng?: number | null
          location_text?: string
          owner_secret_hash?: string | null
          province?: string | null
          seen_at?: string | null
          species?: string | null
          state?: string
          status?: string
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      suspended_posts_log: {
        Row: {
          data: Json | null
          id: string
          original_post_id: string | null
          post_type: string
          reason: string | null
          reason_code: string | null
          suspended_at: string
          suspended_by: string | null
        }
        Insert: {
          data?: Json | null
          id?: string
          original_post_id?: string | null
          post_type: string
          reason?: string | null
          reason_code?: string | null
          suspended_at?: string
          suspended_by?: string | null
        }
        Update: {
          data?: Json | null
          id?: string
          original_post_id?: string | null
          post_type?: string
          reason?: string | null
          reason_code?: string | null
          suspended_at?: string
          suspended_by?: string | null
        }
        Relationships: []
      }
      user_blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      user_highlights: {
        Row: {
          created_at: string
          id: string
          post_id: string
          post_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          post_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          post_type?: string
          user_id?: string
        }
        Relationships: []
      }
      veterinarians: {
        Row: {
          address: string
          country: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          images: string[] | null
          location_lat: number | null
          location_lng: number | null
          name: string
          phone: string | null
          province: string | null
          services: string[] | null
          status: string
          updated_at: string
          user_id: string | null
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          address: string
          country?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          images?: string[] | null
          location_lat?: number | null
          location_lng?: number | null
          name: string
          phone?: string | null
          province?: string | null
          services?: string[] | null
          status?: string
          updated_at?: string
          user_id?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string
          country?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          images?: string[] | null
          location_lat?: number | null
          location_lng?: number | null
          name?: string
          phone?: string | null
          province?: string | null
          services?: string[] | null
          status?: string
          updated_at?: string
          user_id?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_post_contact_info: {
        Args: { post_id: string; post_table: string }
        Returns: {
          contact_email: string
          contact_phone: string
          contact_whatsapp: string
          store_contact: string
        }[]
      }
      get_unread_message_count: {
        Args: { user_id: string }
        Returns: number
      }
      resolve_post: {
        Args: { owner_secret: string; post_id: string; post_type: string }
        Returns: boolean
      }
      submit_report: {
        Args: {
          payload?: Json
          post_id: string
          post_type: string
          reason: string
          reason_code: string
          suspended_by?: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

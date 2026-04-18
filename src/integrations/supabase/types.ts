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
      groups: {
        Row: {
          created_at: string
          created_by: string | null
          departure_month: string
          hotel_madinah: string | null
          hotel_makkah: string | null
          id: string
          name: string
          notes: string | null
          pax_target: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          departure_month: string
          hotel_madinah?: string | null
          hotel_makkah?: string | null
          id?: string
          name: string
          notes?: string | null
          pax_target?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          departure_month?: string
          hotel_madinah?: string | null
          hotel_makkah?: string | null
          id?: string
          name?: string
          notes?: string | null
          pax_target?: number
          updated_at?: string
        }
        Relationships: []
      }
      jamaah: {
        Row: {
          created_at: string
          date_of_birth: string | null
          full_name: string
          gender: string | null
          group_id: string
          id: string
          notes: string | null
          passport_expiry: string | null
          passport_number: string | null
          phone: string | null
          room_type: Database["public"]["Enums"]["room_type"] | null
          status: Database["public"]["Enums"]["jamaah_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          full_name: string
          gender?: string | null
          group_id: string
          id?: string
          notes?: string | null
          passport_expiry?: string | null
          passport_number?: string | null
          phone?: string | null
          room_type?: Database["public"]["Enums"]["room_type"] | null
          status?: Database["public"]["Enums"]["jamaah_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          full_name?: string
          gender?: string | null
          group_id?: string
          id?: string
          notes?: string | null
          passport_expiry?: string | null
          passport_number?: string | null
          phone?: string | null
          room_type?: Database["public"]["Enums"]["room_type"] | null
          status?: Database["public"]["Enums"]["jamaah_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jamaah_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      jamaah_documents: {
        Row: {
          document_type: Database["public"]["Enums"]["document_type"]
          file_name: string
          file_path: string
          id: string
          jamaah_id: string
          mime_type: string | null
          uploaded_at: string
        }
        Insert: {
          document_type: Database["public"]["Enums"]["document_type"]
          file_name: string
          file_path: string
          id?: string
          jamaah_id: string
          mime_type?: string | null
          uploaded_at?: string
        }
        Update: {
          document_type?: Database["public"]["Enums"]["document_type"]
          file_name?: string
          file_path?: string
          id?: string
          jamaah_id?: string
          mime_type?: string | null
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jamaah_documents_jamaah_id_fkey"
            columns: ["jamaah_id"]
            isOneToOne: false
            referencedRelation: "jamaah"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      quotations: {
        Row: {
          additional_services: Json | null
          client_name: string
          created_at: string
          created_by: string | null
          currency: string
          double_price: number | null
          exclusions: Json | null
          fx_rate: number | null
          group_id: string | null
          hotel_madinah: string | null
          hotel_makkah: string | null
          id: string
          inclusions: Json | null
          notes: string | null
          pax: number
          quad_price: number | null
          triple_price: number | null
        }
        Insert: {
          additional_services?: Json | null
          client_name: string
          created_at?: string
          created_by?: string | null
          currency?: string
          double_price?: number | null
          exclusions?: Json | null
          fx_rate?: number | null
          group_id?: string | null
          hotel_madinah?: string | null
          hotel_makkah?: string | null
          id?: string
          inclusions?: Json | null
          notes?: string | null
          pax: number
          quad_price?: number | null
          triple_price?: number | null
        }
        Update: {
          additional_services?: Json | null
          client_name?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          double_price?: number | null
          exclusions?: Json | null
          fx_rate?: number | null
          group_id?: string | null
          hotel_madinah?: string | null
          hotel_makkah?: string | null
          id?: string
          inclusions?: Json | null
          notes?: string | null
          pax?: number
          quad_price?: number | null
          triple_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff"
      document_type: "passport" | "photo" | "visa" | "ticket" | "other"
      jamaah_status:
        | "registered"
        | "document_uploaded"
        | "visa_processing"
        | "visa_approved"
        | "ready_for_departure"
        | "departed"
      room_type: "quad" | "triple" | "double"
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
      app_role: ["admin", "staff"],
      document_type: ["passport", "photo", "visa", "ticket", "other"],
      jamaah_status: [
        "registered",
        "document_uploaded",
        "visa_processing",
        "visa_approved",
        "ready_for_departure",
        "departed",
      ],
      room_type: ["quad", "triple", "double"],
    },
  },
} as const

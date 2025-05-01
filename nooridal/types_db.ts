export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      baby_diaries: {
        Row: {
          content: string
          created_at: string | null
          diary_date: string
          diary_images: Json | null
          id: string
          pregnancy_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          diary_date: string
          diary_images?: Json | null
          id?: string
          pregnancy_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          diary_date?: string
          diary_images?: Json | null
          id?: string
          pregnancy_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "baby_diaries_pregnancy_id_fkey"
            columns: ["pregnancy_id"]
            isOneToOne: false
            referencedRelation: "pregnancies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "baby_diaries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          chat_title: string | null
          created_at: string | null
          id: string
          message_count: number | null
          pregnancy_id: string | null
          status: Database["public"]["Enums"]["pregnancy_status"]
          topic: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          chat_title?: string | null
          created_at?: string | null
          id?: string
          message_count?: number | null
          pregnancy_id?: string | null
          status?: Database["public"]["Enums"]["pregnancy_status"]
          topic?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          chat_title?: string | null
          created_at?: string | null
          id?: string
          message_count?: number | null
          pregnancy_id?: string | null
          status?: Database["public"]["Enums"]["pregnancy_status"]
          topic?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_pregnancy_id_fkey"
            columns: ["pregnancy_id"]
            isOneToOne: false
            referencedRelation: "pregnancies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          all_day: boolean | null
          color: string | null
          created_at: string | null
          description: string | null
          end_time: string | null
          id: string
          start_time: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          all_day?: boolean | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          id?: string
          start_time: string
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          all_day?: boolean | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          id?: string
          start_time?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string | null
          follower_id: string | null
          following_id: string | null
          id: number
        }
        Insert: {
          created_at?: string | null
          follower_id?: string | null
          following_id?: string | null
          id?: number
        }
        Update: {
          created_at?: string | null
          follower_id?: string | null
          following_id?: string | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      llm_conversations: {
        Row: {
          chat_room_id: string | null
          created_at: string | null
          id: string
          query: string
          response: string
          source_documents: Json | null
          updated_at: string | null
          user_info: Json | null
          using_rag: boolean | null
        }
        Insert: {
          chat_room_id?: string | null
          created_at?: string | null
          id?: string
          query: string
          response: string
          source_documents?: Json | null
          updated_at?: string | null
          user_info?: Json | null
          using_rag?: boolean | null
        }
        Update: {
          chat_room_id?: string | null
          created_at?: string | null
          id?: string
          query?: string
          response?: string
          source_documents?: Json | null
          updated_at?: string | null
          user_info?: Json | null
          using_rag?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "llm_conversations_chat_room_id_fkey"
            columns: ["chat_room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      pregnancies: {
        Row: {
          baby_gender: string | null
          baby_name: string | null
          created_at: string | null
          current_week: string | null
          due_date: string | null
          guardian_id: string | null
          high_risk: boolean | null
          id: string
          status: Database["public"]["Enums"]["pregnancy_status"]
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          baby_gender?: string | null
          baby_name?: string | null
          created_at?: string | null
          current_week?: string | null
          due_date?: string | null
          guardian_id?: string | null
          high_risk?: boolean | null
          id?: string
          status?: Database["public"]["Enums"]["pregnancy_status"]
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          baby_gender?: string | null
          baby_name?: string | null
          created_at?: string | null
          current_week?: string | null
          due_date?: string | null
          guardian_id?: string | null
          high_risk?: boolean | null
          id?: string
          status?: Database["public"]["Enums"]["pregnancy_status"]
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pregnancies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pregnancy_summaries: {
        Row: {
          created_at: string | null
          id: string
          pregnancy_id: string | null
          summary: string | null
          week: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          pregnancy_id?: string | null
          summary?: string | null
          week?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          pregnancy_id?: string | null
          summary?: string | null
          week?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pregnancy_summaries_pregnancy_id_fkey"
            columns: ["pregnancy_id"]
            isOneToOne: false
            referencedRelation: "pregnancies"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          invitation_code: string | null
          name: string
          phone_number: string | null
          profile_image_url: string | null
          updated_at: string | null
          user_auth_id: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          invitation_code?: string | null
          name: string
          phone_number?: string | null
          profile_image_url?: string | null
          updated_at?: string | null
          user_auth_id: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          invitation_code?: string | null
          name?: string
          phone_number?: string | null
          profile_image_url?: string | null
          updated_at?: string | null
          user_auth_id?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      event_type:
        | "appointment"
        | "medication"
        | "symptom"
        | "exercise"
        | "other"
      pregnancy_status: "active" | "inactive" | "done"
      user_type: "pregnant" | "guardian"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      event_type: ["appointment", "medication", "symptom", "exercise", "other"],
      pregnancy_status: ["active", "inactive", "done"],
      user_type: ["pregnant", "guardian"],
    },
  },
} as const

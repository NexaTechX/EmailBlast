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
      ab_tests: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          end_date: string | null
          id: string
          name: string
          start_date: string | null
          status: string
          updated_at: string | null
          variants: Json
          winner_metric: string | null
          winner_variant_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          name: string
          start_date?: string | null
          status: string
          updated_at?: string | null
          variants?: Json
          winner_metric?: string | null
          winner_variant_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          name?: string
          start_date?: string | null
          status?: string
          updated_at?: string | null
          variants?: Json
          winner_metric?: string | null
          winner_variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ab_tests_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_analytics: {
        Row: {
          campaign_id: string | null
          device_info: Json | null
          email: string | null
          event_type: string
          id: string
          location_info: Json | null
          metadata: Json | null
          occurred_at: string | null
          subscriber_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          device_info?: Json | null
          email?: string | null
          event_type: string
          id?: string
          location_info?: Json | null
          metadata?: Json | null
          occurred_at?: string | null
          subscriber_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          device_info?: Json | null
          email?: string | null
          event_type?: string
          id?: string
          location_info?: Json | null
          metadata?: Json | null
          occurred_at?: string | null
          subscriber_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_analytics_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_analytics_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_automations: {
        Row: {
          actions: Json
          campaign_id: string | null
          created_at: string | null
          id: string
          name: string
          status: string
          triggers: Json
          updated_at: string | null
        }
        Insert: {
          actions?: Json
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          name: string
          status: string
          triggers?: Json
          updated_at?: string | null
        }
        Update: {
          actions?: Json
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
          status?: string
          triggers?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_automations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          automation_enabled: boolean | null
          content: string
          created_at: string | null
          id: string
          is_cold_outreach: boolean | null
          list_id: string | null
          metadata: Json | null
          scheduled_for: string | null
          sender_email: string
          sender_name: string
          sent_at: string | null
          status: string
          subject: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          automation_enabled?: boolean | null
          content: string
          created_at?: string | null
          id?: string
          is_cold_outreach?: boolean | null
          list_id?: string | null
          metadata?: Json | null
          scheduled_for?: string | null
          sender_email: string
          sender_name: string
          sent_at?: string | null
          status: string
          subject: string
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          automation_enabled?: boolean | null
          content?: string
          created_at?: string | null
          id?: string
          is_cold_outreach?: boolean | null
          list_id?: string | null
          metadata?: Json | null
          scheduled_for?: string | null
          sender_email?: string
          sender_name?: string
          sent_at?: string | null
          status?: string
          subject?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "subscriber_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      cold_outreach_sequences: {
        Row: {
          calls: Json | null
          campaign_id: string | null
          created_at: string | null
          emails: Json
          id: string
          name: string
          status: string
          updated_at: string | null
        }
        Insert: {
          calls?: Json | null
          campaign_id?: string | null
          created_at?: string | null
          emails?: Json
          id?: string
          name: string
          status: string
          updated_at?: string | null
        }
        Update: {
          calls?: Json | null
          campaign_id?: string | null
          created_at?: string | null
          emails?: Json
          id?: string
          name?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cold_outreach_sequences_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      subscriber_lists: {
        Row: {
          created_at: string | null
          description: string | null
          engagement_rate: number | null
          id: string
          name: string
          total_subscribers: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          engagement_rate?: number | null
          id?: string
          name: string
          total_subscribers?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          engagement_rate?: number | null
          id?: string
          name?: string
          total_subscribers?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string | null
          email: string
          engagement_score: number | null
          first_name: string | null
          id: string
          last_name: string | null
          list_id: string | null
          metadata: Json | null
          subscribed_at: string | null
          tags: string[] | null
          unsubscribed_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          engagement_score?: number | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          list_id?: string | null
          metadata?: Json | null
          subscribed_at?: string | null
          tags?: string[] | null
          unsubscribed_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          engagement_score?: number | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          list_id?: string | null
          metadata?: Json | null
          subscribed_at?: string | null
          tags?: string[] | null
          unsubscribed_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscribers_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "subscriber_lists"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      handle_unsubscribe: {
        Args: {
          email_param: string
          campaign_id_param: string
        }
        Returns: undefined
      }
      import_subscribers: {
        Args: {
          list_id_param: string
          subscribers_param: Json
        }
        Returns: undefined
      }
      search_posts: {
        Args: {
          search_query: string
        }
        Returns: {
          id: string
          title: string
          excerpt: string
          slug: string
          author_id: string
          created_at: string
        }[]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

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
      billing_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_id: string
          mpesa_receipt: string | null
          notes: string | null
          payment_date: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          phone_number: string | null
          transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          invoice_id: string
          mpesa_receipt?: string | null
          notes?: string | null
          payment_date?: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          phone_number?: string | null
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string
          mpesa_receipt?: string | null
          notes?: string | null
          payment_date?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          phone_number?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          amount: number
          charge_type: Database["public"]["Enums"]["charge_type"]
          created_at: string
          description: string
          id: string
          invoice_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          amount: number
          charge_type: Database["public"]["Enums"]["charge_type"]
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          quantity?: number
          unit_price: number
        }
        Update: {
          amount?: number
          charge_type?: Database["public"]["Enums"]["charge_type"]
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_paid: number
          apartment_id: string
          apartment_name: string
          balance: number
          created_at: string
          due_date: string
          id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal: number
          tenant_id: string
          tenant_name: string
          tenant_phone: string
          total_amount: number
          unit_number: string
          updated_at: string
        }
        Insert: {
          amount_paid?: number
          apartment_id: string
          apartment_name: string
          balance?: number
          created_at?: string
          due_date: string
          id?: string
          invoice_number: string
          issue_date?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tenant_id: string
          tenant_name: string
          tenant_phone: string
          total_amount?: number
          unit_number: string
          updated_at?: string
        }
        Update: {
          amount_paid?: number
          apartment_id?: string
          apartment_name?: string
          balance?: number
          created_at?: string
          due_date?: string
          id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          tenant_id?: string
          tenant_name?: string
          tenant_phone?: string
          total_amount?: number
          unit_number?: string
          updated_at?: string
        }
        Relationships: []
      }
      mpesa_transactions: {
        Row: {
          account_reference: string | null
          amount: number
          checkout_request_id: string
          created_at: string
          id: string
          merchant_request_id: string | null
          mpesa_receipt_number: string | null
          phone_number: string
          rent_period_id: string | null
          result_code: number | null
          result_desc: string | null
          status: string
          tenant_id: string | null
          transaction_date: string | null
          transaction_desc: string | null
          updated_at: string
        }
        Insert: {
          account_reference?: string | null
          amount: number
          checkout_request_id: string
          created_at?: string
          id?: string
          merchant_request_id?: string | null
          mpesa_receipt_number?: string | null
          phone_number: string
          rent_period_id?: string | null
          result_code?: number | null
          result_desc?: string | null
          status?: string
          tenant_id?: string | null
          transaction_date?: string | null
          transaction_desc?: string | null
          updated_at?: string
        }
        Update: {
          account_reference?: string | null
          amount?: number
          checkout_request_id?: string
          created_at?: string
          id?: string
          merchant_request_id?: string | null
          mpesa_receipt_number?: string | null
          phone_number?: string
          rent_period_id?: string | null
          result_code?: number | null
          result_desc?: string | null
          status?: string
          tenant_id?: string | null
          transaction_date?: string | null
          transaction_desc?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mpesa_transactions_rent_period_id_fkey"
            columns: ["rent_period_id"]
            isOneToOne: false
            referencedRelation: "rent_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mpesa_transactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_billing: {
        Row: {
          apartment_id: string
          billing_day: number
          created_at: string
          due_day: number
          id: string
          is_active: boolean
          items: Json
          tenant_id: string
          updated_at: string
        }
        Insert: {
          apartment_id: string
          billing_day?: number
          created_at?: string
          due_day?: number
          id?: string
          is_active?: boolean
          items?: Json
          tenant_id: string
          updated_at?: string
        }
        Update: {
          apartment_id?: string
          billing_day?: number
          created_at?: string
          due_day?: number
          id?: string
          is_active?: boolean
          items?: Json
          tenant_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      rent_payments: {
        Row: {
          amount: number
          bank_reference: string | null
          created_at: string
          id: string
          mpesa_receipt: string | null
          notes: string | null
          payment_date: string
          payment_method: Database["public"]["Enums"]["rent_payment_method"]
          phone_number: string | null
          rent_period_id: string
          tenant_id: string
          transaction_id: string | null
          verified: boolean
          verified_at: string | null
        }
        Insert: {
          amount: number
          bank_reference?: string | null
          created_at?: string
          id?: string
          mpesa_receipt?: string | null
          notes?: string | null
          payment_date?: string
          payment_method: Database["public"]["Enums"]["rent_payment_method"]
          phone_number?: string | null
          rent_period_id: string
          tenant_id: string
          transaction_id?: string | null
          verified?: boolean
          verified_at?: string | null
        }
        Update: {
          amount?: number
          bank_reference?: string | null
          created_at?: string
          id?: string
          mpesa_receipt?: string | null
          notes?: string | null
          payment_date?: string
          payment_method?: Database["public"]["Enums"]["rent_payment_method"]
          phone_number?: string | null
          rent_period_id?: string
          tenant_id?: string
          transaction_id?: string | null
          verified?: boolean
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rent_payments_rent_period_id_fkey"
            columns: ["rent_period_id"]
            isOneToOne: false
            referencedRelation: "rent_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rent_payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rent_periods: {
        Row: {
          amount_paid: number
          balance: number | null
          created_at: string
          due_date: string
          id: string
          month: number
          payment_reference: string | null
          rent_amount: number
          status: Database["public"]["Enums"]["rent_status"]
          tenant_id: string
          updated_at: string
          year: number
        }
        Insert: {
          amount_paid?: number
          balance?: number | null
          created_at?: string
          due_date: string
          id?: string
          month: number
          payment_reference?: string | null
          rent_amount: number
          status?: Database["public"]["Enums"]["rent_status"]
          tenant_id: string
          updated_at?: string
          year: number
        }
        Update: {
          amount_paid?: number
          balance?: number | null
          created_at?: string
          due_date?: string
          id?: string
          month?: number
          payment_reference?: string | null
          rent_amount?: number
          status?: Database["public"]["Enums"]["rent_status"]
          tenant_id?: string
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "rent_periods_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          apartment_id: string
          apartment_name: string
          created_at: string
          due_day: number
          id: string
          name: string
          phone: string
          rent_amount: number
          unit_number: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          apartment_id: string
          apartment_name: string
          created_at?: string
          due_day?: number
          id?: string
          name: string
          phone: string
          rent_amount?: number
          unit_number: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          apartment_id?: string
          apartment_name?: string
          created_at?: string
          due_day?: number
          id?: string
          name?: string
          phone?: string
          rent_amount?: number
          unit_number?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
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
      generate_invoice_number: { Args: never; Returns: string }
      generate_payment_reference: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      mark_overdue_rent_periods: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "tenant"
      charge_type:
        | "rent"
        | "water"
        | "electricity"
        | "garbage"
        | "security"
        | "parking"
        | "other"
      invoice_status: "draft" | "pending" | "paid" | "overdue" | "cancelled"
      payment_method: "mpesa" | "bank_transfer" | "cash" | "card"
      rent_payment_method: "mpesa" | "bank_transfer" | "cash"
      rent_status: "paid" | "unpaid" | "overdue" | "partial"
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
      app_role: ["admin", "tenant"],
      charge_type: [
        "rent",
        "water",
        "electricity",
        "garbage",
        "security",
        "parking",
        "other",
      ],
      invoice_status: ["draft", "pending", "paid", "overdue", "cancelled"],
      payment_method: ["mpesa", "bank_transfer", "cash", "card"],
      rent_payment_method: ["mpesa", "bank_transfer", "cash"],
      rent_status: ["paid", "unpaid", "overdue", "partial"],
    },
  },
} as const

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {

      traders: {
        Row: {
          id: string;
          phone: string;
          first_name: string;
          last_name: string;
          email: string;
          market: string;
          business_type: string;
          squad_customer_id: string;
          virtual_account_number: string;
          beneficiary_account: string;
          bank_code: string;
          bvn: string | null;
          trust_score: number;
          credit_limit: number;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["traders"]["Row"],
          "id" | "created_at" | "trust_score" | "credit_limit"
        > & {
          id?: string;
          trust_score?: number;
          credit_limit?: number;
        };
        Update: Partial<Database["public"]["Tables"]["traders"]["Insert"]>;
      };
      transactions: {
        Row: {
          id: string;
          trader_id: string;
          transaction_reference: string;
          sender_name: string;
          sender_account: string | null;
          amount: number;
          settled_amount: number;
          transaction_date: string;
          raw_payload: Json;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["transactions"]["Row"],
          "id" | "created_at"
        > & { id?: string };
        Update: Partial<Database["public"]["Tables"]["transactions"]["Insert"]>;
      };
      loans: {
        Row: {
          id: string;
          trader_id: string;
          principal: number;
          fee: number;
          total_due: number;
          amount_repaid: number;
          holdback_percentage: number;
          tier: number;
          status: "active" | "repaid" | "overdue" | "defaulted";
          disbursed_at: string;
          due_at: string;
          repaid_at: string | null;
          squad_payout_reference: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["loans"]["Row"],
          "id" | "amount_repaid"
        > & { id?: string; amount_repaid?: number };
        Update: Partial<Database["public"]["Tables"]["loans"]["Insert"]>;
      };
      savings: {
        Row: {
          id: string;
          trader_id: string;
          balance: number;
          rule_type: string;
          rule_percentage: number;
          rule_threshold: number;
          goal_amount: number | null;
          goal_label: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["savings"]["Row"],
          "id" | "created_at" | "balance"
        > & { id?: string; balance?: number };
        Update: Partial<Database["public"]["Tables"]["savings"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Trader = Database["public"]["Tables"]["traders"]["Row"];
export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
export type Loan = Database["public"]["Tables"]["loans"]["Row"];
export type Savings = Database["public"]["Tables"]["savings"]["Row"];

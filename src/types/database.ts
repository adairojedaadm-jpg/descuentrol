export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      banks: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          website_url: string | null
          promotions_url: string | null
          scraper_type: 'PLAYWRIGHT' | 'CHEERIO'
          scraper_config: Json | null
          last_scraped_at: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          website_url?: string | null
          promotions_url?: string | null
          scraper_type?: 'PLAYWRIGHT' | 'CHEERIO'
          scraper_config?: Json | null
          last_scraped_at?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string | null
          website_url?: string | null
          promotions_url?: string | null
          scraper_type?: 'PLAYWRIGHT' | 'CHEERIO'
          scraper_config?: Json | null
          last_scraped_at?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      cards: {
        Row: {
          id: string
          bank_id: string
          name: string
          network: 'VISA' | 'MASTERCARD' | 'AMEX' | 'LOCAL'
          color: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          bank_id: string
          name: string
          network: 'VISA' | 'MASTERCARD' | 'AMEX' | 'LOCAL'
          color?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bank_id?: string
          name?: string
          network?: 'VISA' | 'MASTERCARD' | 'AMEX' | 'LOCAL'
          color?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          icon: string
          color: string | null
          display_order: number
          active: boolean
        }
        Insert: {
          id?: string
          name: string
          slug: string
          icon: string
          color?: string | null
          display_order?: number
          active?: boolean
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          icon?: string
          color?: string | null
          display_order?: number
          active?: boolean
        }
        Relationships: []
      }
      promotions: {
        Row: {
          id: string
          bank_id: string
          title: string
          description: string | null
          discount_type: 'PERCENTAGE' | 'CASHBACK' | 'CUOTAS' | 'FREE'
          discount_value: number | null
          discount_display: string
          conditions: string | null
          valid_from: string | null
          valid_to: string | null
          days_of_week: number[]
          is_active: boolean
          verified_by_admin: boolean
          source_type: 'HTML' | 'PDF'
          source_url: string | null
          pdf_url: string | null
          external_hash: string | null
          scraped_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          bank_id: string
          title: string
          description?: string | null
          discount_type: 'PERCENTAGE' | 'CASHBACK' | 'CUOTAS' | 'FREE'
          discount_value?: number | null
          discount_display: string
          conditions?: string | null
          valid_from?: string | null
          valid_to?: string | null
          days_of_week?: number[]
          is_active?: boolean
          verified_by_admin?: boolean
          source_type?: 'HTML' | 'PDF'
          source_url?: string | null
          pdf_url?: string | null
          external_hash?: string | null
          scraped_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bank_id?: string
          title?: string
          description?: string | null
          discount_type?: 'PERCENTAGE' | 'CASHBACK' | 'CUOTAS' | 'FREE'
          discount_value?: number | null
          discount_display?: string
          conditions?: string | null
          valid_from?: string | null
          valid_to?: string | null
          days_of_week?: number[]
          is_active?: boolean
          verified_by_admin?: boolean
          source_type?: 'HTML' | 'PDF'
          source_url?: string | null
          pdf_url?: string | null
          external_hash?: string | null
          scraped_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      promotion_cards: {
        Row: {
          promotion_id: string
          card_id: string
        }
        Insert: {
          promotion_id: string
          card_id: string
        }
        Update: {
          promotion_id?: string
          card_id?: string
        }
        Relationships: []
      }
      promotion_categories: {
        Row: {
          promotion_id: string
          category_id: string
        }
        Insert: {
          promotion_id: string
          category_id: string
        }
        Update: {
          promotion_id?: string
          category_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          id: string
          email: string
          category_id: string
          card_names: string[]
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          category_id: string
          card_names?: string[]
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          category_id?: string
          card_names?: string[]
          active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      scraping_logs: {
        Row: {
          id: string
          bank_id: string
          started_at: string
          finished_at: string | null
          status: 'RUNNING' | 'SUCCESS' | 'FAILED' | 'PARTIAL'
          promos_found: number
          promos_created: number
          promos_updated: number
          promos_deleted: number
          error_message: string | null
        }
        Insert: {
          id?: string
          bank_id: string
          started_at?: string
          finished_at?: string | null
          status?: 'RUNNING' | 'SUCCESS' | 'FAILED' | 'PARTIAL'
          promos_found?: number
          promos_created?: number
          promos_updated?: number
          promos_deleted?: number
          error_message?: string | null
        }
        Update: {
          id?: string
          bank_id?: string
          started_at?: string
          finished_at?: string | null
          status?: 'RUNNING' | 'SUCCESS' | 'FAILED' | 'PARTIAL'
          promos_found?: number
          promos_created?: number
          promos_updated?: number
          promos_deleted?: number
          error_message?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_promotions: {
        Args: {
          p_categoria: string
          p_tarjetas: string[]
          p_dia?: number
        }
        Returns: {
          id: string
          title: string
          description: string | null
          discount_type: 'PERCENTAGE' | 'CASHBACK' | 'CUOTAS' | 'FREE'
          discount_value: number | null
          discount_display: string
          conditions: string | null
          valid_to: string | null
          days_of_week: number[]
          source_type: 'HTML' | 'PDF'
          pdf_url: string | null
          source_url: string | null
          bank: { id: string; name: string; logo_url: string | null }
          matched_cards: { id: string; name: string; network: string }[]
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

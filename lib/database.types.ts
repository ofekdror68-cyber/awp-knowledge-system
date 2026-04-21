export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      machines: {
        Row: {
          id: string
          brand: string
          model: string
          serial_number: string | null
          year: number | null
          notes: string | null
          hours_current: number
          hours_last_service: number
          last_service_date: string | null
          next_service_due_date: string | null
          next_service_due_hours: number | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          brand: string
          model: string
          serial_number?: string | null
          year?: number | null
          notes?: string | null
          hours_current?: number
          hours_last_service?: number
          last_service_date?: string | null
          next_service_due_date?: string | null
          next_service_due_hours?: number | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          brand?: string
          model?: string
          serial_number?: string | null
          year?: number | null
          notes?: string | null
          hours_current?: number
          hours_last_service?: number
          last_service_date?: string | null
          next_service_due_date?: string | null
          next_service_due_hours?: number | null
          status?: string
        }
      }
      documents: {
        Row: {
          id: string
          machine_brand: string | null
          machine_model: string | null
          doc_type: string
          title: string
          file_url: string | null
          uploaded_at: string
        }
        Insert: {
          id?: string
          machine_brand?: string | null
          machine_model?: string | null
          doc_type?: string
          title: string
          file_url?: string | null
          uploaded_at?: string
        }
        Update: {
          machine_brand?: string | null
          machine_model?: string | null
          doc_type?: string
          title?: string
          file_url?: string | null
        }
      }
      document_chunks: {
        Row: {
          id: string
          document_id: string
          content: string
          embedding: number[] | null
          page_number: number | null
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          content: string
          embedding?: number[] | null
          page_number?: number | null
          created_at?: string
        }
        Update: {
          content?: string
          embedding?: number[] | null
          page_number?: number | null
        }
      }
      parts: {
        Row: {
          id: string
          brand: string | null
          model_compatibility: string[]
          part_number: string | null
          description: string
          image_url: string | null
          location_description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          brand?: string | null
          model_compatibility?: string[]
          part_number?: string | null
          description: string
          image_url?: string | null
          location_description?: string | null
        }
        Update: {
          brand?: string | null
          model_compatibility?: string[]
          part_number?: string | null
          description?: string
          image_url?: string | null
          location_description?: string | null
        }
      }
      faults: {
        Row: {
          id: string
          machine_brand: string | null
          machine_model: string | null
          fault_code: string | null
          symptoms: string
          solution: string
          source: string
          times_used: number
          verified: boolean
          created_at: string
        }
        Insert: {
          id?: string
          machine_brand?: string | null
          machine_model?: string | null
          fault_code?: string | null
          symptoms: string
          solution: string
          source?: string
          times_used?: number
          verified?: boolean
        }
        Update: {
          machine_brand?: string | null
          machine_model?: string | null
          fault_code?: string | null
          symptoms?: string
          solution?: string
          source?: string
          times_used?: number
          verified?: boolean
        }
      }
      fault_feedback: {
        Row: {
          id: string
          fault_id: string | null
          how_was_solved: string
          worked: boolean
          machine_brand: string | null
          machine_model: string | null
          original_symptoms: string | null
          created_at: string
        }
        Insert: {
          id?: string
          fault_id?: string | null
          how_was_solved: string
          worked?: boolean
          machine_brand?: string | null
          machine_model?: string | null
          original_symptoms?: string | null
        }
        Update: {
          how_was_solved?: string
          worked?: boolean
        }
      }
      web_knowledge: {
        Row: {
          id: string
          url: string | null
          title: string | null
          content_summary: string
          brands_mentioned: string[]
          embedding: number[] | null
          scraped_at: string
        }
        Insert: {
          id?: string
          url?: string | null
          title?: string | null
          content_summary: string
          brands_mentioned?: string[]
          embedding?: number[] | null
        }
        Update: {
          url?: string | null
          title?: string | null
          content_summary?: string
          brands_mentioned?: string[]
          embedding?: number[] | null
        }
      }
      maintenance_schedules: {
        Row: {
          id: string
          machine_id: string
          interval_type: string
          tasks: Json
          created_at: string
        }
        Insert: {
          id?: string
          machine_id: string
          interval_type: string
          tasks?: Json
        }
        Update: {
          tasks?: Json
        }
      }
      service_logs: {
        Row: {
          id: string
          machine_id: string
          date: string
          technician_name: string | null
          hours_at_service: number | null
          service_type: string
          checklist_completed: Json
          parts_replaced: Json
          notes: string | null
          next_service_hours: number | null
          next_service_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          machine_id: string
          date?: string
          technician_name?: string | null
          hours_at_service?: number | null
          service_type: string
          checklist_completed?: Json
          parts_replaced?: Json
          notes?: string | null
          next_service_hours?: number | null
          next_service_date?: string | null
        }
        Update: {
          date?: string
          technician_name?: string | null
          hours_at_service?: number | null
          service_type?: string
          checklist_completed?: Json
          parts_replaced?: Json
          notes?: string | null
          next_service_hours?: number | null
          next_service_date?: string | null
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

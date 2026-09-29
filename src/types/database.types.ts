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
      profiles: {
        Row: {
          id: string
          role: string
          created_at: string
        }
        Insert: {
          id: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          role?: string
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          slug: string
          description: string
          problem: string
          solution: string
          category: string
          technologies: string[]
          thumbnail_url: string | null
          github_url: string | null
          demo_url: string | null
          status: string
          is_featured: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description: string
          problem: string
          solution: string
          category: string
          technologies?: string[]
          thumbnail_url?: string | null
          github_url?: string | null
          demo_url?: string | null
          status?: string
          is_featured?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string
          problem?: string
          solution?: string
          category?: string
          technologies?: string[]
          thumbnail_url?: string | null
          github_url?: string | null
          demo_url?: string | null
          status?: string
          is_featured?: boolean
          created_at?: string
        }
      }
      members: {
        Row: {
          id: string
          name: string
          branch: string | null
          year: string | null
          role: string | null
          github_url: string | null
          linkedin_url: string | null
          avatar_url: string | null
        }
        Insert: {
          id?: string
          name: string
          branch?: string | null
          year?: string | null
          role?: string | null
          github_url?: string | null
          linkedin_url?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          name?: string
          branch?: string | null
          year?: string | null
          role?: string | null
          github_url?: string | null
          linkedin_url?: string | null
          avatar_url?: string | null
        }
      }
      project_members: {
        Row: {
          project_id: string
          member_id: string
        }
        Insert: {
          project_id: string
          member_id: string
        }
        Update: {
          project_id?: string
          member_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

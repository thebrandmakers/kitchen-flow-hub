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
      files: {
        Row: {
          created_at: string | null
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          name: string
          project_id: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          name: string
          project_id?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          name?: string
          project_id?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kitchen_clients: {
        Row: {
          address: string
          client_id: string
          created_at: string | null
          email: string
          id: string
          name: string
          password_hash: string | null
          phone: string
          updated_at: string | null
        }
        Insert: {
          address: string
          client_id: string
          created_at?: string | null
          email: string
          id?: string
          name: string
          password_hash?: string | null
          phone: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          client_id?: string
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          password_hash?: string | null
          phone?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      kitchen_project_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          assigned_to: string | null
          created_at: string | null
          id: string
          notes: string | null
          phase_id: string | null
          project_id: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          phase_id?: string | null
          project_id?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          phase_id?: string | null
          project_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kitchen_project_assignments_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "kitchen_project_phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kitchen_project_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "kitchen_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      kitchen_project_files: {
        Row: {
          created_at: string | null
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          project_id: string | null
          task_id: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          project_id?: string | null
          task_id?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          project_id?: string | null
          task_id?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kitchen_project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "kitchen_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kitchen_project_files_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "kitchen_project_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kitchen_project_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      kitchen_project_phases: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          phase_name: Database["public"]["Enums"]["project_phase_name"]
          phase_number: number
          project_id: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          phase_name: Database["public"]["Enums"]["project_phase_name"]
          phase_number: number
          project_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          phase_name?: Database["public"]["Enums"]["project_phase_name"]
          phase_number?: number
          project_id?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kitchen_project_phases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "kitchen_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      kitchen_project_tasks: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          due_date: string | null
          id: string
          notes: string | null
          phase_id: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          task_name: string
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          phase_id?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          task_name: string
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          phase_id?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          task_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kitchen_project_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kitchen_project_tasks_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "kitchen_project_phases"
            referencedColumns: ["id"]
          },
        ]
      }
      kitchen_projects: {
        Row: {
          budget_bracket: Database["public"]["Enums"]["budget_bracket"]
          client_id: string | null
          created_at: string | null
          current_phase: number | null
          existing_kitchen_images: string[] | null
          id: string
          intake_pdf_url: string | null
          kitchen_shape: Database["public"]["Enums"]["kitchen_shape"]
          materials: Database["public"]["Enums"]["kitchen_material"][]
          project_reference: string
          reference_images: string[] | null
          status: Database["public"]["Enums"]["project_status"] | null
          updated_at: string | null
        }
        Insert: {
          budget_bracket: Database["public"]["Enums"]["budget_bracket"]
          client_id?: string | null
          created_at?: string | null
          current_phase?: number | null
          existing_kitchen_images?: string[] | null
          id?: string
          intake_pdf_url?: string | null
          kitchen_shape: Database["public"]["Enums"]["kitchen_shape"]
          materials: Database["public"]["Enums"]["kitchen_material"][]
          project_reference: string
          reference_images?: string[] | null
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string | null
        }
        Update: {
          budget_bracket?: Database["public"]["Enums"]["budget_bracket"]
          client_id?: string | null
          created_at?: string | null
          current_phase?: number | null
          existing_kitchen_images?: string[] | null
          id?: string
          intake_pdf_url?: string | null
          kitchen_shape?: Database["public"]["Enums"]["kitchen_shape"]
          materials?: Database["public"]["Enums"]["kitchen_material"][]
          project_reference?: string
          reference_images?: string[] | null
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kitchen_projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "kitchen_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          project_id: string | null
          read: boolean | null
          task_id: string | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          project_id?: string | null
          read?: boolean | null
          task_id?: string | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          project_id?: string | null
          read?: boolean | null
          task_id?: string | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "kitchen_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "kitchen_project_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          budget: number | null
          client_id: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          owner_id: string | null
          stage: Database["public"]["Enums"]["project_stage"]
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          budget?: number | null
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          owner_id?: string | null
          stage?: Database["public"]["Enums"]["project_stage"]
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          budget?: number | null
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          owner_id?: string | null
          stage?: Database["public"]["Enums"]["project_stage"]
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          images: string[] | null
          project_id: string | null
          report_date: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          project_id?: string | null
          report_date?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          project_id?: string | null
          report_date?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      Sankalp: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          project_id: string | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          project_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          project_id?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          added_by: string | null
          created_at: string | null
          department: string | null
          id: string
          phone: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          added_by?: string | null
          created_at?: string | null
          department?: string | null
          id?: string
          phone?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          added_by?: string | null
          created_at?: string | null
          department?: string | null
          id?: string
          phone?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_project_reference: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      budget_bracket: "3-5 lakhs" | "5-8 lakhs" | "8-10+ lakhs"
      kitchen_material: "Plywood" | "MDF" | "HDHMR" | "Acrylic" | "Laminate"
      kitchen_shape: "L-shape" | "U-shape" | "Parallel" | "Island" | "Straight"
      project_phase_name:
        | "design_quotation"
        | "confirmation_payment"
        | "production_prep"
        | "factory_production"
        | "site_installation"
        | "closure_feedback"
      project_stage: "quotation" | "design" | "factory" | "site"
      project_status:
        | "intake"
        | "design"
        | "confirmation"
        | "production_prep"
        | "factory"
        | "installation"
        | "closure"
      task_status: "todo" | "in_progress" | "done"
      user_role:
        | "owner"
        | "designer"
        | "client"
        | "worker"
        | "manager"
        | "factory"
        | "installer"
        | "sales"
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
      budget_bracket: ["3-5 lakhs", "5-8 lakhs", "8-10+ lakhs"],
      kitchen_material: ["Plywood", "MDF", "HDHMR", "Acrylic", "Laminate"],
      kitchen_shape: ["L-shape", "U-shape", "Parallel", "Island", "Straight"],
      project_phase_name: [
        "design_quotation",
        "confirmation_payment",
        "production_prep",
        "factory_production",
        "site_installation",
        "closure_feedback",
      ],
      project_stage: ["quotation", "design", "factory", "site"],
      project_status: [
        "intake",
        "design",
        "confirmation",
        "production_prep",
        "factory",
        "installation",
        "closure",
      ],
      task_status: ["todo", "in_progress", "done"],
      user_role: [
        "owner",
        "designer",
        "client",
        "worker",
        "manager",
        "factory",
        "installer",
        "sales",
      ],
    },
  },
} as const

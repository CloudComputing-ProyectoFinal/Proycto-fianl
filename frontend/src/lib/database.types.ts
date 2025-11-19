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
      sedes: {
        Row: {
          id: string
          name: string
          address: string
          phone: string
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          phone: string
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          phone?: string
          active?: boolean
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          sede_id: string | null
          email: string
          role: 'cliente' | 'digitador' | 'cheff' | 'cocinero' | 'empacador' | 'repartidor' | 'admin'
          name: string
          phone: string | null
          active: boolean
          created_at: string
        }
        Insert: {
          id: string
          sede_id?: string | null
          email: string
          role: 'cliente' | 'digitador' | 'cheff' | 'cocinero' | 'empacador' | 'repartidor' | 'admin'
          name: string
          phone?: string | null
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sede_id?: string | null
          email?: string
          role?: 'cliente' | 'digitador' | 'cheff' | 'cocinero' | 'empacador' | 'repartidor' | 'admin'
          name?: string
          phone?: string | null
          active?: boolean
          created_at?: string
        }
      }
      menu_items: {
        Row: {
          id: string
          sede_id: string | null
          name: string
          description: string | null
          price: number
          category: string
          image_url: string | null
          available: boolean
          preparation_time: number
          station: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sede_id?: string | null
          name: string
          description?: string | null
          price: number
          category: string
          image_url?: string | null
          available?: boolean
          preparation_time?: number
          station?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sede_id?: string | null
          name?: string
          description?: string | null
          price?: number
          category?: string
          image_url?: string | null
          available?: boolean
          preparation_time?: number
          station?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          sede_id: string
          customer_id: string | null
          customer_name: string
          customer_phone: string
          customer_address: string | null
          order_type: 'delivery' | 'pickup'
          status: 'pending' | 'confirmed' | 'in_kitchen' | 'cooking' | 'packaging' | 'ready' | 'on_the_way' | 'delivered' | 'cancelled'
          total_amount: number
          assigned_cheff_id: string | null
          assigned_driver_id: string | null
          notes: string | null
          created_at: string
          confirmed_at: string | null
          kitchen_start_at: string | null
          ready_at: string | null
          delivered_at: string | null
        }
        Insert: {
          id?: string
          order_number: string
          sede_id: string
          customer_id?: string | null
          customer_name: string
          customer_phone: string
          customer_address?: string | null
          order_type: 'delivery' | 'pickup'
          status?: 'pending' | 'confirmed' | 'in_kitchen' | 'cooking' | 'packaging' | 'ready' | 'on_the_way' | 'delivered' | 'cancelled'
          total_amount: number
          assigned_cheff_id?: string | null
          assigned_driver_id?: string | null
          notes?: string | null
          created_at?: string
          confirmed_at?: string | null
          kitchen_start_at?: string | null
          ready_at?: string | null
          delivered_at?: string | null
        }
        Update: {
          id?: string
          order_number?: string
          sede_id?: string
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string
          customer_address?: string | null
          order_type?: 'delivery' | 'pickup'
          status?: 'pending' | 'confirmed' | 'in_kitchen' | 'cooking' | 'packaging' | 'ready' | 'on_the_way' | 'delivered' | 'cancelled'
          total_amount?: number
          assigned_cheff_id?: string | null
          assigned_driver_id?: string | null
          notes?: string | null
          created_at?: string
          confirmed_at?: string | null
          kitchen_start_at?: string | null
          ready_at?: string | null
          delivered_at?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          menu_item_id: string | null
          name: string
          price: number
          quantity: number
          station: string | null
          status: 'pending' | 'assigned' | 'cooking' | 'ready'
          assigned_cook_id: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          order_id: string
          menu_item_id?: string | null
          name: string
          price: number
          quantity?: number
          station?: string | null
          status?: 'pending' | 'assigned' | 'cooking' | 'ready'
          assigned_cook_id?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          menu_item_id?: string | null
          name?: string
          price?: number
          quantity?: number
          station?: string | null
          status?: 'pending' | 'assigned' | 'cooking' | 'ready'
          assigned_cook_id?: string | null
          notes?: string | null
        }
      }
      cart_items: {
        Row: {
          id: string
          customer_id: string
          menu_item_id: string
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          menu_item_id: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          menu_item_id?: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
      }
      order_status_history: {
        Row: {
          id: string
          order_id: string
          status: string
          changed_by: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          status: string
          changed_by?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          status?: string
          changed_by?: string | null
          notes?: string | null
          created_at?: string
        }
      }
    }
    Functions: {
      generate_order_number: {
        Args: Record<string, never>
        Returns: string
      }
      update_order_status: {
        Args: {
          p_order_id: string
          p_new_status: string
          p_user_id: string
          p_notes?: string | null
        }
        Returns: void
      }
    }
  }
}

/**
 * Tipos para pedidos (orders)
 */

export type OrderStatus =
  | 'pending'
  | 'packaging'
  | 'ready'
  | 'on_the_way'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  id: string;
  menu_item_id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone?: string | null;
  customer_address?: string | null;
  order_type: 'delivery' | 'pickup';
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  assigned_driver_id?: string | null;
  sede_id?: string | null;
  created_at?: string; // ISO date
  notes?: string | null;
}

export interface DriverSummary {
  id: string;
  nombre?: string;
  apellido?: string;
  celular?: string;
}

export interface OrderWithDriver extends Order {
  driver?: DriverSummary | null;
}

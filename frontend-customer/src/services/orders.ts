/**
 * 📦 Orders Service
 * Servicio para gestión de órdenes/pedidos
 * Integración con E-Commerce Service
 */

import { API_ENDPOINTS, apiRequest } from './api/config';

// ===== Interfaces =====
export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  additionalInfo?: string;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'CARD' | 'CASH' | 'ONLINE';
  deliveryMethod: 'DELIVERY' | 'PICKUP';
  notes?: string;
}

export interface Order {
  orderId: string;
  userId: string;
  tenantId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'IN_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  paymentMethod: string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  deliveryMethod: string;
  shippingAddress: ShippingAddress;
  estimatedDeliveryTime?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory?: Array<{
    status: string;
    timestamp: string;
    notes?: string;
  }>;
}

export interface OrdersListResponse {
  orders: Order[];
  count: number;
  nextToken?: string;
}

// ===== API Functions =====

/**
 * Crear una nueva orden
 */
export async function createOrder(orderData: CreateOrderRequest): Promise<{ message: string; orderId: string; order: Order }> {
  const url = `${API_ENDPOINTS.ECOMMERCE}/orders`;
  
  return apiRequest<{ message: string; orderId: string; order: Order }>(url, {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
}

/**
 * Obtener las órdenes del usuario actual
 */
export async function getMyOrders(limit = 20): Promise<OrdersListResponse> {
  const url = `${API_ENDPOINTS.ECOMMERCE}/orders/my-orders?limit=${limit}`;
  
  return apiRequest<OrdersListResponse>(url, {
    method: 'GET',
  });
}

/**
 * Obtener una orden específica por ID
 */
export async function getOrderById(orderId: string): Promise<Order> {
  const url = `${API_ENDPOINTS.ECOMMERCE}/orders/${orderId}`;
  
  return apiRequest<Order>(url, {
    method: 'GET',
  });
}

/**
 * Cancelar una orden (solo si está en estado PENDING o CONFIRMED)
 */
export async function cancelOrder(orderId: string, reason?: string): Promise<{ message: string }> {
  const url = `${API_ENDPOINTS.ECOMMERCE}/orders/${orderId}/cancel`;
  
  return apiRequest<{ message: string }>(url, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

/**
 * Tracking de orden en tiempo real
 */
export async function trackOrder(orderId: string): Promise<Order> {
  const url = `${API_ENDPOINTS.ECOMMERCE}/orders/${orderId}/track`;
  
  return apiRequest<Order>(url, {
    method: 'GET',
  });
}

/**
 * Obtener historial de estados de una orden
 */
export async function getOrderStatusHistory(orderId: string): Promise<Array<{
  status: string;
  timestamp: string;
  notes?: string;
}>> {
  const order = await getOrderById(orderId);
  return order.statusHistory || [];
}

/**
 * Listar todas las órdenes (Admin)
 */
export async function listAllOrders(params?: {
  status?: string;
  limit?: number;
  nextToken?: string;
}): Promise<OrdersListResponse> {
  const queryParams = new URLSearchParams();
  
  if (params?.status) queryParams.append('status', params.status);
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.nextToken) queryParams.append('nextToken', params.nextToken);
  
  const url = `${API_ENDPOINTS.ECOMMERCE}/orders?${queryParams.toString()}`;
  
  return apiRequest<OrdersListResponse>(url, {
    method: 'GET',
  });
}

/**
 * Actualizar estado de orden (Admin/Kitchen/Delivery)
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: Order['status'],
  notes?: string
): Promise<{ message: string; order: Order }> {
  const url = `${API_ENDPOINTS.ECOMMERCE}/orders/${orderId}/status`;
  
  return apiRequest<{ message: string; order: Order }>(url, {
    method: 'PUT',
    body: JSON.stringify({ status: newStatus, notes }),
  });
}

export default {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  trackOrder,
  getOrderStatusHistory,
  listAllOrders,
  updateOrderStatus,
};

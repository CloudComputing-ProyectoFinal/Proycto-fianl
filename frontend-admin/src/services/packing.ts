/**
 * Servicio para Empaquetadores (Packers)
 * Gestión de órdenes READY → PACKED
 */

const ORDERS_API_BASE = import.meta.env.VITE_API_URL_ORDERS || '';

console.log('📦 Packing Service - ORDERS_API_BASE:', ORDERS_API_BASE);

// ==================== TYPES ====================

export interface Order {
  orderId: string;
  tenantId: string;
  userId: string;
  status: 'CREATED' | 'ASSIGNED' | 'PREPARING' | 'COOKING' | 'READY' | 'PACKED' | 'DELIVERING' | 'DELIVERED';
  items: OrderItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  customerInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
  };
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface ListOrdersResponse {
  data: {
    orders: Order[];
    count: number;
  };
}

// ==================== API FUNCTIONS ====================

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * GET /orders
 * Obtener TODAS las órdenes del sistema
 */
export const getAllOrders = async (): Promise<ListOrdersResponse> => {
  const url = `${ORDERS_API_BASE}/orders`;
  console.log('🌍 [Packing.getAllOrders] URL:', url);
  
  const res = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  console.log('📡 [Packing.getAllOrders] Status:', res.status);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ [Packing.getAllOrders] Error:', errorText);
    throw new Error(`getAllOrders failed: ${res.status}`);
  }
  
  const data = await res.json();
  console.log('✅ [Packing.getAllOrders] Data:', data);
  return data;
};

/**
 * PUT /orders/{orderId}
 * Marcar orden como PACKED (Empaquetador)
 */
export const markOrderPacked = async (orderId: string): Promise<any> => {
  const encodedOrderId = encodeURIComponent(orderId);
  const url = `${ORDERS_API_BASE}/orders/${encodedOrderId}`;
  
  console.log('📦 [Packing.markOrderPacked] OrderId:', orderId);
  console.log('🔐 [Packing.markOrderPacked] Encoded:', encodedOrderId);
  console.log('🌍 [Packing.markOrderPacked] URL:', url);
  console.log('📦 [Packing.markOrderPacked] Body:', { status: 'PACKED' });
  
  const res = await fetch(url, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status: 'PACKED' }),
  });
  
  console.log('📡 [Packing.markOrderPacked] Status:', res.status);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ [Packing.markOrderPacked] Error:', errorText);
    throw new Error(`markOrderPacked failed: ${res.status}`);
  }
  
  const data = await res.json();
  console.log('✅ [Packing.markOrderPacked] Data:', data);
  return data;
};

// ========== EXPORT DEFAULT ==========

export default {
  getAllOrders,
  markOrderPacked,
};

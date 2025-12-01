/**
 * Servicio para Cocineros (COOK) - Gestión de órdenes asignadas
 * API Base: https://9gxi9k52k6.execute-api.us-east-1.amazonaws.com/dev
 */

const API_BASE = import.meta.env.VITE_API_URL_KITCHEN || '';
// Orders API usa el endpoint rpepuemxp5 (sin /auth ni /kitchen)
const ORDERS_API_BASE = import.meta.env.VITE_API_URL_ORDERS || '';

console.log('🔧 Kitchen Service - API_BASE:', API_BASE);
console.log('🔧 Kitchen Service - ORDERS_API_BASE:', ORDERS_API_BASE);

// ==================== TYPES ====================

export interface KitchenOrder {
  orderId: string;
  tenantId: string;
  userId: string;
  status: 'CREATED' | 'PREPARED' | 'ASSIGNED' | 'PREPARING' | 'COOKING' | 'READY';
  items: OrderItem[];
  assignedChefId?: string;
  assignedChefName?: string;
  total: number;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  estimatedCompletionTime?: string;
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
  preparationTime?: number;
}

export interface UpdateOrderPayload {
  status?: 'PREPARING' | 'COOKING';
  notes?: string;
  estimatedCompletionTime?: string;
  tenantId: string;
}

export interface UpdateOrderStatusPayload {
  status: 'PREPARING' | 'COOKING' | 'READY';
  tenantId: string;
}

export interface MarkReadyPayload {
  tenantId: string;
  notes?: string;
}

// Response Types
export interface ListOrdersResponse {
  data: {
    orders: KitchenOrder[];
    count: number;
  };
}

export interface OrderResponse {
  data: {
    order: KitchenOrder;
  };
}

export interface MessageResponse {
  message: string;
  orderId?: string;
  status?: string;
}

// ==================== API FUNCTIONS ====================

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// ========== ORDERS - COOK ==========

/**
 * GET /orders
 * Obtener TODAS las órdenes del sistema (endpoint general)
 * Endpoint: https://rpepuemxp5.execute-api.us-east-1.amazonaws.com/dev/orders
 */
export const getAllOrders = async (): Promise<ListOrdersResponse> => {
  const url = `${ORDERS_API_BASE}/orders`;
  console.log('🌐 [getAllOrders] Calling URL:', url);
  console.log('🔑 [getAllOrders] Headers:', getAuthHeaders());
  
  const res = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  console.log('📡 [getAllOrders] Response status:', res.status);
  console.log('📡 [getAllOrders] Response ok:', res.ok);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ [getAllOrders] Error response:', errorText);
    throw new Error(`getAllOrders failed: ${res.status} - ${errorText}`);
  }
  
  const data = await res.json();
  console.log('✅ [getAllOrders] Response data:', data);
  return data;
};

/**
 * PUT /orders/{orderId}
 * Aceptar una orden CREATED y cambiarla a PREPARING
 * Endpoint: https://rpepuemxp5.execute-api.us-east-1.amazonaws.com/dev/orders/{orderId}
 */
export const acceptOrder = async (orderId: string): Promise<OrderResponse> => {
  // URL encode el orderId completo (con ORDER# incluido)
  const encodedOrderId = encodeURIComponent(orderId);
  const url = `${ORDERS_API_BASE}/orders/${encodedOrderId}`;
  
  console.log('🔄 [acceptOrder] Original orderId:', orderId);
  console.log('🔐 [acceptOrder] Encoded orderId:', encodedOrderId);
  console.log('🌐 [acceptOrder] Calling URL:', url);
  console.log('📦 [acceptOrder] Body:', { status: 'PREPARING' });
  
  const res = await fetch(url, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status: 'PREPARING' }),
  });
  
  console.log('📡 [acceptOrder] Response status:', res.status);
  console.log('📡 [acceptOrder] Response ok:', res.ok);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ [acceptOrder] Error response:', errorText);
    throw new Error(`acceptOrder failed: ${res.status} - ${errorText}`);
  }
  
  const data = await res.json();
  console.log('✅ [acceptOrder] Response data:', data);
  return data;
};

/**
 * GET /kitchen/orders
 * Obtener órdenes asignadas al cocinero actual
 * El backend debe filtrar por el chefId del token JWT
 */
export const getMyOrders = async (): Promise<ListOrdersResponse> => {
  const res = await fetch(`${API_BASE}/kitchen/orders`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`getMyOrders failed: ${res.status}`);
  return res.json();
};

/**
 * GET /kitchen/orders/{orderId}
 * Obtener detalle de una orden específica asignada al cocinero
 */
export const getOrder = async (orderId: string): Promise<OrderResponse> => {
  const res = await fetch(`${API_BASE}/kitchen/orders/${orderId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`getOrder failed: ${res.status}`);
  return res.json();
};

/**
 * PUT /kitchen/orders/{orderId}
 * Actualizar información de la orden (ej: empezar a cocinar, agregar notas)
 */
export const updateOrder = async (
  orderId: string,
  payload: UpdateOrderPayload
): Promise<OrderResponse> => {
  const res = await fetch(`${API_BASE}/kitchen/orders/${orderId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`updateOrder failed: ${res.status}`);
  return res.json();
};

/**
 * PUT /kitchen/orders/{orderId}/status
 * Cambiar el estado de la orden
 * Estados: ASSIGNED → PREPARING → COOKING → READY
 */
export const updateOrderStatus = async (
  orderId: string,
  payload: UpdateOrderStatusPayload
): Promise<OrderResponse> => {
  const res = await fetch(`${API_BASE}/kitchen/orders/${orderId}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`updateOrderStatus failed: ${res.status}`);
  return res.json();
};

/**
 * POST /kitchen/orders/{orderId}/ready
 * Marcar la orden como LISTA para entregar
 */
export const markOrderReady = async (
  orderId: string,
  payload: MarkReadyPayload
): Promise<MessageResponse> => {
  const res = await fetch(`${API_BASE}/kitchen/orders/${orderId}/ready`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`markOrderReady failed: ${res.status}`);
  return res.json();
};

// ========== HELPER FUNCTIONS ==========

/**
 * Obtener el siguiente estado en el flujo de cocina
 */
export const getNextStatus = (currentStatus: string): string => {
  const statusFlow: Record<string, string> = {
    'ASSIGNED': 'PREPARING',
    'PREPARING': 'COOKING',
    'COOKING': 'READY',
  };
  return statusFlow[currentStatus] || currentStatus;
};

/**
 * Obtener el color del badge según el estado
 */
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'CREATED': 'bg-purple-100 text-purple-800',
    'PREPARED': 'bg-indigo-100 text-indigo-800',
    'ASSIGNED': 'bg-blue-100 text-blue-800',
    'PREPARING': 'bg-yellow-100 text-yellow-800',
    'COOKING': 'bg-orange-100 text-orange-800',
    'READY': 'bg-green-100 text-green-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Obtener el texto en español del estado
 */
export const getStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    'CREATED': 'Nueva',
    'PREPARED': 'Preparada',
    'ASSIGNED': 'Asignada',
    'PREPARING': 'Preparando',
    'COOKING': 'Cocinando',
    'READY': 'Lista',
  };
  return texts[status] || status;
};

// ========== EXPORT DEFAULT ==========

export default {
  getAllOrders,
  acceptOrder,
  getMyOrders,
  getOrder,
  updateOrder,
  updateOrderStatus,
  markOrderReady,
  getNextStatus,
  getStatusColor,
  getStatusText,
};

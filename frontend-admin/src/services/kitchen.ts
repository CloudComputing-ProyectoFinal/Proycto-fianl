/**
 * Servicio para Cocineros (COOK) - Gestión de órdenes asignadas
 * API Base: https://9gxi9k52k6.execute-api.us-east-1.amazonaws.com/dev
 */

const API_BASE = import.meta.env.VITE_API_URL_KITCHEN || '';

// ==================== TYPES ====================

export interface KitchenOrder {
  orderId: string;
  tenantId: string;
  userId: string;
  status: 'ASSIGNED' | 'PREPARING' | 'COOKING' | 'READY';
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
    'ASSIGNED': 'Asignada',
    'PREPARING': 'Preparando',
    'COOKING': 'Cocinando',
    'READY': 'Lista',
  };
  return texts[status] || status;
};

// ========== EXPORT DEFAULT ==========

export default {
  getMyOrders,
  getOrder,
  updateOrder,
  updateOrderStatus,
  markOrderReady,
  getNextStatus,
  getStatusColor,
  getStatusText,
};

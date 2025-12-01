/**
 * Servicio para Chef Ejecutivo - Gestión de cocina y chefs
 * API Base: https://9gxi9k52k6.execute-api.us-east-1.amazonaws.com/dev
 */

const API_BASE = import.meta.env.VITE_API_URL_KITCHEN || '';

// ==================== TYPES ====================

// Chef/Cook Types
export interface Chef {
  cook_id: string;
  userId: string;
  tenant_id: string;
  name: string;
  role: string;
  isAvailable: boolean;
  currentOrders: number;
  createdAt: string;
  // Campos opcionales para compatibilidad
  chefId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  specialization?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'ON_BREAK';
  updatedAt?: string;
}

export interface CreateChefPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  specialization?: string;
  tenantId: string;
}

export interface UpdateChefPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  specialization?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'ON_BREAK';
}

// Order Types
export interface KitchenOrder {
  orderId: string;
  tenantId: string;
  userId: string;
  status: 'CREATED' | 'ASSIGNED' | 'PREPARING' | 'COOKING' | 'READY' | 'DELIVERED';
  items: OrderItem[];
  assignedChefId?: string;
  assignedChefName?: string;
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

export interface AssignOrderPayload {
  chefId: string;
  tenantId: string;
}

export interface OrderStatusUpdate {
  status: 'ASSIGNED' | 'PREPARING' | 'COOKING' | 'READY';
  tenantId: string;
}

// Response Types
export interface ListOrdersResponse {
  data: {
    orders: KitchenOrder[];
    count: number;
  };
}

export interface ListChefsResponse {
  success: boolean;
  message: string;
  data: {
    cooks: Chef[];
    chefs?: Chef[]; // Para compatibilidad
    count?: number;
  };
}

export interface OrderResponse {
  data: {
    order: KitchenOrder;
  };
}

export interface ChefResponse {
  data: {
    chef: Chef;
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

// ========== ORDERS ==========

/**
 * GET /kitchen/orders
 * Listar TODAS las órdenes de cocina (Chef Ejecutivo)
 */
export const listOrders = async (): Promise<ListOrdersResponse> => {
  const res = await fetch(`${API_BASE}/kitchen/orders`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`listOrders failed: ${res.status}`);
  return res.json();
};

/**
 * GET /kitchen/orders/created
 * Obtener órdenes recién creadas (sin asignar)
 */
export const getCreatedOrders = async (): Promise<ListOrdersResponse> => {
  const res = await fetch(`${API_BASE}/kitchen/orders/created`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`getCreatedOrders failed: ${res.status}`);
  return res.json();
};

/**
 * GET /kitchen/orders/{orderId}
 * Obtener detalle de una orden específica
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
 * POST /kitchen/orders/{orderId}/assign
 * Asignar una orden a un chef específico
 */
export const assignOrder = async (
  orderId: string,
  payload: AssignOrderPayload
): Promise<OrderResponse> => {
  const res = await fetch(`${API_BASE}/kitchen/orders/${orderId}/assign`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`assignOrder failed: ${res.status}`);
  return res.json();
};

// ========== CHEFS ==========

/**
 * GET /kitchen/chefs?role={role}
 * Listar todos los chefs/cocineros
 * @param role - Filtrar por rol: "Cheff Ejecutivo" o "Cocinero" (opcional)
 * Response: { success, message, data: { cooks: [...] } }
 */
export const listChefs = async (role?: string): Promise<ListChefsResponse> => {
  const url = role 
    ? `${API_BASE}/kitchen/chefs?role=${encodeURIComponent(role)}`
    : `${API_BASE}/kitchen/chefs`;
  
  const res = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`listChefs failed: ${res.status}`);
  return res.json();
};

/**
 * POST /kitchen/chefs
 * Crear un nuevo chef
 */
export const createChef = async (payload: CreateChefPayload): Promise<ChefResponse> => {
  const res = await fetch(`${API_BASE}/kitchen/chefs`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`createChef failed: ${res.status}`);
  return res.json();
};

/**
 * GET /kitchen/chefs/{chefId}
 * Obtener detalle de un chef específico
 */
export const getChef = async (chefId: string): Promise<ChefResponse> => {
  const res = await fetch(`${API_BASE}/kitchen/chefs/${chefId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`getChef failed: ${res.status}`);
  return res.json();
};

/**
 * PUT /kitchen/chefs/{chefId}
 * Actualizar información de un chef
 */
export const updateChef = async (
  chefId: string,
  payload: UpdateChefPayload
): Promise<ChefResponse> => {
  const res = await fetch(`${API_BASE}/kitchen/chefs/${chefId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`updateChef failed: ${res.status}`);
  return res.json();
};

/**
 * DELETE /kitchen/chefs/{chefId}
 * Eliminar un chef
 */
export const deleteChef = async (chefId: string): Promise<{ message: string }> => {
  const res = await fetch(`${API_BASE}/kitchen/chefs/${chefId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`deleteChef failed: ${res.status}`);
  return res.json();
};

/**
 * POST /kitchen/chefs/seed
 * Seed de chefs (solo desarrollo)
 */
export const seedChefs = async (): Promise<{ message: string; count: number }> => {
  const res = await fetch(`${API_BASE}/kitchen/chefs/seed`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`seedChefs failed: ${res.status}`);
  return res.json();
};

// ========== EXPORT DEFAULT ==========

export default {
  // Orders
  listOrders,
  getCreatedOrders,
  getOrder,
  assignOrder,
  
  // Chefs
  listChefs,
  createChef,
  getChef,
  updateChef,
  deleteChef,
  seedChefs,
};

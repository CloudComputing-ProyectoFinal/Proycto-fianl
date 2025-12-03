import { loadEnv } from '../utils/loaderEnv';

const API_BASE = loadEnv('DELIVERY_URL');
// Orders API usa VITE_API_URL_ORDERS (rpepuemxp5)
const ORDERS_API_BASE = import.meta.env.VITE_API_URL_ORDERS || '';
console.log('[delivery.ts] API_BASE:', API_BASE);
console.log('[delivery.ts] ORDERS_API_BASE:', ORDERS_API_BASE);

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ========== INTERFACES ==========

export interface Driver {
  driverId: string;
  userId: string;
  tenant_id: string;
  name: string;
  vehicleType: 'moto' | 'auto' | 'bicicleta' | string;
  isAvailable: boolean;
  currentDeliveries: number;
  createdAt: string;
}

export interface AvailableDriversResponse {
  success: boolean;
  message: string;
  data: {
    drivers: Driver[];
    count: number;
    tenant_id: string;
  };
}

export interface ListDriversResponse {
  success: boolean;
  message: string;
  data: {
    drivers: Driver[];
    count: number;
    tenant_id: string;
  };
}

export interface Handler {
  name: string;
  role: string;
  email: string;
  timestamp: string;
}

export interface HistoryEntry {
  handler: Handler;
  updatedBy: Handler;
  status: string;
  timestamp: string;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
}

export interface DeliveryAddress {
  street: string;
  district: string;
  city: string;
  zipCode: string;
  lat: number | null;
  lng: number | null;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  imageUrl?: string;
}

export interface PaymentDetails {
  transactionId: string;
  processedAt: string;
}

export interface DeliveryOrder {
  orderId: string;
  tenant_id: string;
  userId: string;
  status: 'CREATED' | 'ASSIGNED' | 'PREPARING' | 'READY' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  customerInfo: CustomerInfo;
  deliveryAddress: DeliveryAddress;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentDetails: PaymentDetails;
  notes?: string;
  driver_id?: string;
  driver_name?: string;
  assigned_at?: string;
  handler: Handler;
  updatedBy: Handler;
  history: HistoryEntry[];
  createdAt: string;
  updatedAt: string;
  updated_at?: string;
}

export interface CurrentOrderResponse {
  success: boolean;
  message: string;
  data: {
    order: DeliveryOrder;
  };
}

export interface AssignDriverPayload {
  driverId: string;
  orderId: string;
}

export interface UpdateOrderStatusPayload {
  status: 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  location?: {
    latitude: number;
    longitude: number;
  };
}

// ========== DRIVERS ==========

/**
 * GET /delivery/drivers/available
 * Obtener lista de conductores disponibles
 */
export const getAvailableDrivers = async (): Promise<AvailableDriversResponse> => {
  const res = await fetch(`${API_BASE}/delivery/drivers/available`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`getAvailableDrivers failed: ${res.status}`);
  return res.json();
};

/**
 * GET /delivery/drivers
 * Listar todos los conductores
 */
export const listDrivers = async (): Promise<ListDriversResponse> => {
  const res = await fetch(`${API_BASE}/delivery/drivers`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`listDrivers failed: ${res.status}`);
  return res.json();
};

/**
 * GET /delivery/drivers/{driverId}
 * Obtener detalle de un conductor específico
 */
export const getDriver = async (driverId: string): Promise<{ success: boolean; data: Driver }> => {
  const res = await fetch(`${API_BASE}/delivery/drivers/${driverId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`getDriver failed: ${res.status}`);
  return res.json();
};

/**
 * PUT /delivery/drivers/{driverId}
 * Actualizar información de un conductor
 */
export const updateDriver = async (
  driverId: string,
  payload: Partial<Driver>
): Promise<{ success: boolean; data: Driver }> => {
  const res = await fetch(`${API_BASE}/delivery/drivers/${driverId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`updateDriver failed: ${res.status}`);
  return res.json();
};

/**
 * DELETE /delivery/drivers/{driverId}
 * Eliminar un conductor
 */
export const deleteDriver = async (driverId: string): Promise<{ message: string }> => {
  const res = await fetch(`${API_BASE}/delivery/drivers/${driverId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`deleteDriver failed: ${res.status}`);
  return res.json();
};

// ========== DELIVERY ORDERS ==========

/**
 * GET /delivery/orders/current
 * Obtener la orden actual asignada al conductor logueado
 * Este es el endpoint principal para el dashboard de delivery
 */
export const getCurrentOrder = async (): Promise<CurrentOrderResponse> => {
  const res = await fetch(`${API_BASE}/delivery/orders/current`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`getCurrentOrder failed: ${res.status}`);
  return res.json();
};

/**
 * GET /orders
 * Listar todas las órdenes del sistema
 * Usa ORDERS_API_BASE (rpepuemxp5.execute-api.us-east-1.amazonaws.com/dev/orders)
 */
export const listDeliveryOrders = async (): Promise<{ success: boolean; data: { orders: DeliveryOrder[] } }> => {
  const res = await fetch(`${ORDERS_API_BASE}/orders`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`listDeliveryOrders failed: ${res.status}`);
  return res.json();
};

/**
 * GET /delivery/orders/{orderId}
 * Obtener detalle de una orden específica
 */
export const getDeliveryOrder = async (orderId: string): Promise<{ success: boolean; data: DeliveryOrder }> => {
  const res = await fetch(`${API_BASE}/delivery/orders/${orderId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`getDeliveryOrder failed: ${res.status}`);
  return res.json();
};

/**
 * POST /delivery/orders/{orderId}/assign
 * Asignar un conductor a una orden
 */
export const assignDriverToOrder = async (
  orderId: string,
  payload: { driverId: string }
): Promise<{ success: boolean; message: string }> => {
  const res = await fetch(`${API_BASE}/delivery/orders/${orderId}/assign`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`assignDriverToOrder failed: ${res.status}`);
  return res.json();
};

/**
 * PUT /orders/{orderId}
 * Actualizar el estado de una orden (DELIVERING o DELIVERED)
 * Este endpoint usa el API de orders (rpepuemxp5), no el de delivery
 */
export const updateOrderStatus = async (
  orderId: string,
  status: 'DELIVERING' | 'DELIVERED'
): Promise<{ success: boolean; message: string; data: { message: string; order: DeliveryOrder } }> => {
  const encodedOrderId = encodeURIComponent(orderId);
  const url = `${ORDERS_API_BASE}/orders/${encodedOrderId}`;
  
  console.log('🚚 [Delivery.updateOrderStatus] OrderId:', orderId);
  console.log('🔐 [Delivery.updateOrderStatus] Encoded:', encodedOrderId);
  console.log('🌍 [Delivery.updateOrderStatus] URL:', url);
  console.log('📦 [Delivery.updateOrderStatus] Body:', { status });
  
  const res = await fetch(url, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  
  console.log('📡 [Delivery.updateOrderStatus] Status:', res.status);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error('❌ [Delivery.updateOrderStatus] Error:', errorText);
    throw new Error(`updateOrderStatus failed: ${res.status}`);
  }
  
  const data = await res.json();
  console.log('✅ [Delivery.updateOrderStatus] Data:', data);
  return data;
};

/**
 * GET /delivery/orders/{orderId}/tracking
 * Obtener información de tracking de una orden
 */
export const getOrderTracking = async (orderId: string): Promise<{ success: boolean; data: any }> => {
  const res = await fetch(`${API_BASE}/delivery/orders/${orderId}/tracking`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`getOrderTracking failed: ${res.status}`);
  return res.json();
};

// ========== EXPORT DEFAULT ==========

export default {
  // Drivers
  getAvailableDrivers,
  listDrivers,
  getDriver,
  updateDriver,
  deleteDriver,
  
  // Orders
  getCurrentOrder,
  listDeliveryOrders,
  getDeliveryOrder,
  assignDriverToOrder,
  updateOrderStatus,
  getOrderTracking,
};

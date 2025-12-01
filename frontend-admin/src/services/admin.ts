

// Construye headers de autorización a partir del token guardado en localStorage
function getAuthHeaders(): HeadersInit | undefined {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

// Admin service uses dedicated admin API Gateway
const API_BASE = import.meta.env.VITE_API_URL_ADMIN || '';

async function handleResponse(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.status === 204 ? null : res.json();
}

export type DashboardStats = {
  totalOrders: number;
  byStatus: Record<string, number>;
  revenue: number;
};

export interface Driver {
  driverId: string;
  userId: string;
  tenant_id: string;
  name: string;
  vehicleType: string;
  isAvailable: boolean;
  currentDeliveries: number;
  createdAt: string;
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

export async function fetchDashboard() {
  const res = await fetch(`${API_BASE}/admin/dashboard`, { headers: getAuthHeaders() });
  return handleResponse(res);
}

export async function fetchTodayOrders() {
  const res = await fetch(`${API_BASE}/admin/orders/today`, { headers: getAuthHeaders() });
  return handleResponse(res);
}

export async function listProducts(page = 1, perPage = 20) {
  const res = await fetch(`${API_BASE}/admin/products?page=${page}&per_page=${perPage}`, { headers: getAuthHeaders() });
  const json = await handleResponse(res);

  // Expected shapes:
  // { success, message, data: { products: [...], count, tenant_id } }
  // or directly { products: [...], count }
  const data = json && typeof json === 'object' ? (json.data ?? json) : json;

  return {
    products: data.products ?? data.items ?? [],
    count: data.count ?? undefined,
    tenant_id: data.tenant_id ?? data.tenantId ?? undefined,
  };
}

export async function getProduct(id: string) {
  // Encode # as %23 and other special characters in productId for URL safety
  const encodedId = encodeURIComponent(id);
  
  const res = await fetch(`${API_BASE}/admin/products/${encodedId}`, { headers: getAuthHeaders() });
  return handleResponse(res);
}

export type CreateProductPayload = {
  name: string;
  description?: string;
  category?: string;
  price: number;
  currency?: string;
  preparationTimeMinutes?: number;
  isAvailable?: boolean;
  tags?: string[];
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
};

export type CreatedProductResult = {
  product: any;
  s3UploadUrl?: string;
  message?: string;
};

export async function createProduct(payload: CreateProductPayload): Promise<CreatedProductResult> {
  const res = await fetch(`${API_BASE}/admin/products`, {
    method: 'POST',
    headers: { ...(getAuthHeaders() ?? {}), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json = await handleResponse(res);

  // Response shape expected:
  // { success: true, message: 'Success', data: { product: {...}, message: '...', s3UploadUrl: '...' } }
  if (json && typeof json === 'object') {
    const data = json.data ?? json;
    return {
      product: data.product ?? data.product,
      s3UploadUrl: data.s3UploadUrl ?? data.s3_upload_url ?? undefined,
      message: data.message ?? json.message ?? undefined,
    } as CreatedProductResult;
  }

  return { product: json } as CreatedProductResult;
}

export type UpdateProductPayload = {
  name?: string;
  description?: string;
  category?: string;
  price?: number;
  currency?: string;
  preparationTimeMinutes?: number;
  isAvailable?: boolean;
  tags?: string[];
  imageUrl?: string;
};

export type UpdatedProductResult = {
  product: any;
  message?: string;
};

export async function updateProduct(id: string, payload: UpdateProductPayload): Promise<UpdatedProductResult> {
  // Encode # as %23 in productId for URL safety
  const encodedId = id.replace(/#/g, '%23');
  
  const res = await fetch(`${API_BASE}/admin/products/${encodedId}`, {
    method: 'PUT',
    headers: { ...(getAuthHeaders() ?? {}), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json = await handleResponse(res);

  // Response shape: { success, message, data: { product: {...}, message: '...' } }
  if (json && typeof json === 'object') {
    const data = json.data ?? json;
    return {
      product: data.product ?? json,
      message: data.message ?? json.message ?? undefined,
    } as UpdatedProductResult;
  }

  return { product: json } as UpdatedProductResult;
}

export async function deleteProduct(id: string) {
  // Encode # as %23 and other special characters in productId for URL safety
  const encodedId = encodeURIComponent(id);
  
  const res = await fetch(`${API_BASE}/admin/products/${encodedId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

export async function listOrders(query = '') {
  const res = await fetch(`${API_BASE}/admin/orders${query ? `?${query}` : ''}`, { headers: getAuthHeaders() });
  return handleResponse(res);
}

export async function updateOrderStatus(id: string, payload: any) {
  const res = await fetch(`${API_BASE}/admin/orders/${id}`, {
    method: 'PUT',
    headers: { ...(getAuthHeaders() ?? {}), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export type CreateUserPayload = {
  email: string;
  password: string;
  name: string;
  role: string;
  address?: string;
  phoneNumber?: string;
  tenant_id?: string;
};

export type CreateUserResult = {
  success: boolean;
  message: string;
  data: {
    user: any;
  };
};

export async function createUser(payload: CreateUserPayload): Promise<CreateUserResult> {
  const res = await fetch(`${API_BASE}/admin/users`, {
    method: 'POST',
    headers: { ...(getAuthHeaders() ?? {}), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function listUsers(page = 1, perPage = 50) {
  const res = await fetch(`${API_BASE}/admin/users?page=${page}&per_page=${perPage}`, { headers: getAuthHeaders() });
  return handleResponse(res);
}

export async function getUser(userId: string) {
  const res = await fetch(`${API_BASE}/admin/users/${userId}`, { headers: getAuthHeaders() });
  return handleResponse(res);
}

export type UpdateUserPayload = {
  firstName?: string;
  lastName?: string;
  password?: string;
  phoneNumber?: string;
  address?: string;
  role?: string;
  status?: string;
};

export async function updateUser(userId: string, payload: UpdateUserPayload) {
  const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
    method: 'PUT',
    headers: { ...(getAuthHeaders() ?? {}), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteUser(userId: string) {
  const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

export async function updateUserRole(id: string, role: string) {
  const res = await fetch(`${API_BASE}/admin/users/${id}/role`, {
    method: 'PUT',
    headers: { ...(getAuthHeaders() ?? {}), 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });
  return handleResponse(res);
}

/**
 * GET /delivery/drivers
 * Obtener lista de conductores de delivery
 * Endpoint: https://y8b94sjrcc.execute-api.us-east-1.amazonaws.com/dev/delivery/drivers
 */
export async function listDrivers(): Promise<ListDriversResponse> {
  const res = await fetch('https://y8b94sjrcc.execute-api.us-east-1.amazonaws.com/dev/delivery/drivers', {
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
}

export default {
  fetchDashboard,
  fetchTodayOrders,
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  listOrders,
  updateOrderStatus,
  createUser,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  updateUserRole,
  listDrivers,
};

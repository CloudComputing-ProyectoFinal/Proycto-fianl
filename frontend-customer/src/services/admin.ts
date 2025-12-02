/**
 * 👨‍💼 Admin Service
 * Servicio para funciones administrativas
 * Integración con Admin Service
 */

import { API_ENDPOINTS, apiRequest } from './api/config';

// ===== Dashboard =====
export async function fetchDashboard() {
  const url = `${API_ENDPOINTS.ADMIN}/admin/dashboard`;
  return apiRequest(url, { method: 'GET' });
}

// ===== Productos =====
export async function listProducts(page = 1, perPage = 20) {
  const url = `${API_ENDPOINTS.ADMIN}/admin/products?page=${page}&per_page=${perPage}`;
  return apiRequest(url, { method: 'GET' });
}

export async function getProduct(id: string) {
  const url = `${API_ENDPOINTS.ADMIN}/admin/products/${id}`;
  return apiRequest(url, { method: 'GET' });
}

export async function createProduct(payload: any) {
  const url = `${API_ENDPOINTS.ADMIN}/admin/products`;
  return apiRequest(url, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateProduct(id: string, payload: any) {
  const url = `${API_ENDPOINTS.ADMIN}/admin/products/${id}`;
  return apiRequest(url, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteProduct(id: string) {
  const url = `${API_ENDPOINTS.ADMIN}/admin/products/${id}`;
  return apiRequest(url, { method: 'DELETE' });
}

// ===== Órdenes =====
export async function listOrders(query = '') {
  const url = `${API_ENDPOINTS.ADMIN}/admin/orders${query ? `?${query}` : ''}`;
  return apiRequest(url, { method: 'GET' });
}

export async function updateOrderStatus(id: string, payload: any) {
  const url = `${API_ENDPOINTS.ADMIN}/admin/orders/${id}`;
  return apiRequest(url, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

// ===== Usuarios =====
export async function listUsers(page = 1, perPage = 50) {
  const url = `${API_ENDPOINTS.USERS}/admin/users?page=${page}&per_page=${perPage}`;
  return apiRequest(url, { method: 'GET' });
}

export async function updateUserRole(id: string, role: string) {
  const url = `${API_ENDPOINTS.USERS}/admin/users/${id}/role`;
  return apiRequest(url, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });
}

export default {
  fetchDashboard,
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  listOrders,
  updateOrderStatus,
  listUsers,
  updateUserRole,
};

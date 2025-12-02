/**
 * 🔧 API Configuration
 * Configuración centralizada de endpoints del backend
 * Fridays Perú - Sistema de Gestión de Pedidos
 */

import { loadEnv } from '@/utils/loaderEnv';

// ===== URLs de los servicios =====
export const API_ENDPOINTS = {
  // E-Commerce Service (Auth, Products, Cart, Orders)
  ECOMMERCE: loadEnv('ECOMMERCE_URL'),
  AUTH: loadEnv('AUTH_URL'),
  
  // Kitchen Service
  KITCHEN: loadEnv('KITCHEN_URL'),
  
  // Delivery Service
  DELIVERY: loadEnv('DELIVERY_URL'),
  
  // Admin Service
  ADMIN: loadEnv('ADMIN_URL'),
  USERS: loadEnv('USERS_URL'),
  STATS: loadEnv('STATS_URL'),
  REPORTS: loadEnv('REPORTS_URL'),
  
  // WebSocket
  WEBSOCKET: loadEnv('WS_URL'),
  
  // Others
  PLACES: loadEnv('PLACE_URL'),
  INCIDENTS: loadEnv('INCIDENTS_URL'),
};

// ===== Helper: Obtener headers de autenticación =====
export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ===== Helper: Manejo de respuestas =====
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage: string;
    
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorJson.error || errorText;
    } catch {
      errorMessage = errorText || response.statusText;
    }
    
    throw new Error(errorMessage);
  }
  
  // Si es 204 No Content, retornar objeto vacío
  if (response.status === 204) {
    return {} as T;
  }
  
  return response.json();
}

// ===== Helper: Hacer request con auth =====
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });
  
  return handleApiResponse<T>(response);
}

export default {
  API_ENDPOINTS,
  getAuthHeaders,
  handleApiResponse,
  apiRequest,
};

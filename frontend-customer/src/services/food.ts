/**
 * 🍔 Food/Menu Service
 * Servicio para gestión del menú y productos
 * Integración con E-Commerce Service
 */

import type { FoodResponse, ProductApi } from '../lib/menu.types';
import { API_ENDPOINTS, apiRequest } from './api/config';

const BASE = API_ENDPOINTS.ECOMMERCE;

export async function fetchFood(): Promise<FoodResponse> {
  const url = `${BASE}/menu?limit=20`;
  console.log('fetchFood URL:', url);
  
  return apiRequest<FoodResponse>(url, {
    method: 'GET',
  });
}

// Listar productos por categoría (FOOD, DRINK, etc.)
export async function fetchFoodByCategory(category: string): Promise<FoodResponse> {
  const url = `${BASE}/menu/${category}`;
  
  return apiRequest<FoodResponse>(url, {
    method: 'GET',
  });
}

// Crear producto (requiere auth admin)
export async function createProduct(payload: {
  name: string;
  description: string;
  category: string;
  price: number;
  currency?: string;
  isAvailable?: boolean;
  preparationTimeMinutes?: number;
  imageUrl?: string;
  tags?: string[];
}): Promise<{ message: string; product: ProductApi }> {
  const url = `${BASE}/menu/productos`;
  
  return apiRequest<{ message: string; product: ProductApi }>(url, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Editar producto (requiere auth admin)
export async function updateProduct(
  itemId: string,
  payload: {
    name?: string;
    price?: number;
    description?: string;
    category?: string;
    preparationTimeMinutes?: number;
    imageUrl?: string;
    tags?: string[];
  }
): Promise<{ message: string; productId: string }> {
  const url = `${BASE}/menu/items/${itemId}`;
  
  return apiRequest<{ message: string; productId: string }>(url, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

// Cambiar disponibilidad de producto (requiere auth admin)
export async function toggleProductAvailability(
  itemId: string,
  isAvailable: boolean
): Promise<{ message: string }> {
  const url = `${BASE}/menu/items/${itemId}/availability`;
  
  return apiRequest<{ message: string }>(url, {
    method: 'PUT',
    body: JSON.stringify({ isAvailable }),
  });
}

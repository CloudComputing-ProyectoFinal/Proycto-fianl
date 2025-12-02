/**
 * 🔐 Auth Service
 * Servicio de autenticación
 * Integración con E-Commerce Service
 */

import { API_ENDPOINTS, apiRequest } from './api/config';

interface LoginResponse {
  token: string;
  user: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  message: string;
}

interface RegisterResponse {
  token: string;
  user: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  message: string;
}

export async function login(credentials: { email: string; password: string }): Promise<LoginResponse> {
  const url = `${API_ENDPOINTS.AUTH}/auth/login`;
  
  return apiRequest<LoginResponse>(url, {
    method: 'POST',
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password
    })
  });
}

export async function register(data: {
  firstName: string;
  lastName?: string;
  phoneNumber?: string;
  email: string;
  password: string;
  role?: string;
  address?: string;
}): Promise<RegisterResponse> {
  const url = `${API_ENDPOINTS.AUTH}/auth/register`;
  
  return apiRequest<RegisterResponse>(url, {
    method: 'POST',
    body: JSON.stringify({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName || '',
      phoneNumber: data.phoneNumber || '',
      role: data.role || 'USER',
      address: data.address || ''
    })
  });
}

export default { login, register };

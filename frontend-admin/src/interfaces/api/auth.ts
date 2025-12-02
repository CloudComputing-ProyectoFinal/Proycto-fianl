/**
 * Tipados para endpoints de autenticación
 * POST /auth/register
 * POST /auth/login
 */

import type { Role } from './common';

// ==================== REGISTER ====================

export interface RegisterRequest {
  firstName: string;
  lastName?: string;
  phoneNumber?: string;
  email: string;
  // Password plain text
  password: string;
  role?: Role | string;
  address?: string;
}

export interface RegisterResponse {
  message: string;
  token: string;
  user: {
    userId: string;
    email: string;
    firstName: string;
    lastName?: string;
    role: Role | string;
    tenantId?: string | null;
  };
}

// ==================== LOGIN ====================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    userId: string;
    email: string;
    firstName: string;
    lastName?: string;
    role: Role | string;
    tenantId?: string | null;
  };
}

/**
 * Tipados para endpoints de autenticación
 * POST /auth/register
 * POST /auth/login
 */

import type { Role } from './common';

// ==================== REGISTER ====================

export interface RegisterRequest {
  nombre: string;
  apellido: string;
  celular: string;
  correo_electronico: string;
  //TIPO DE DOCUMENTO{DNI, PASAPORTE, CARNET DE EXTRANJERIA}
  contraseña: string;
  rol: Role;
}

export interface RegisterResponse {
  mensaje: string;
  token: string;
  user: {
    id: string;
    correo_electronico: string;
    rol: Role | string;
    nombre: string;
    apellido: string;

  };
}

// ==================== LOGIN ====================

export interface LoginRequest {
  correo_electronico: string;
  contraseña: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    correo_electronico: string;
    rol: Role | string;
    nombre: string;
    apellido: string;
  };
}

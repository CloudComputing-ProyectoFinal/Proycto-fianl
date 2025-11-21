/** Tipos de usuario adaptados a un restaurante */
import type { Role } from '../api/common';

export interface UserProfile {
    id: string;
    nombre: string;
    apellido?: string;
    correo_electronico: string;
    celular?: string;
    role: Role;
    sede_id?: string; // id de la sucursal/restaurant
    activo?: boolean;
    created_at?: string; // ISO date
}

export interface UserResponse {
    id: string;
    correo_electronico: string;
    role: Role;
    nombre: string;
    apellido?: string;
}



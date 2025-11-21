import type { UserProfile } from '../user';

export interface AuthContextType {
    user: UserProfile | null;
    profile: UserProfile | null;
    session: any | null;
    loading: boolean;
    signUp: (data: RegisterRequest) => Promise<{ error: Error | null }>;
    signIn: (credentials: LoginRequest) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
}

export interface LoginRequest {
    correo_electronico: string;
    contraseña: string;
}

export interface AuthResponse {
    message: string;
    token: string;
    user: UserProfile;
}

export interface RegisterRequest {
    nombre: string;
    apellido?: string;
    celular?: string;
    correo_electronico: string;
    contraseña: string;
    rol?: string;
}
import type { UserProfile } from '../user';

// Tipos para el contexto de autenticación
export interface AuthContextType {
    user: UserProfile | null;
    profile: UserProfile | null;
    session: any | null;
    loading: boolean;
    // Mantener compatibilidad con los nombres usados en AuthProvider
    signUp: (data: AuthRegisterRequest) => Promise<{ error: Error | null }>;
    signIn: (credentials: AuthRequest) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
}

export interface AuthRequest {
    email: string;
    password: string;
}

export interface AuthRegisterRequest {
    firstName: string;
    lastName?: string;
    phoneNumber?: string;
    email: string;
    password: string;
    role?: string;
    address?: string;
}

export interface AuthResponse {
    message: string;
    token: string;
    user: UserProfile;
}
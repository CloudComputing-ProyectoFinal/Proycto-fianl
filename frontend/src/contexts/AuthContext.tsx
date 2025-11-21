import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { AuthContextType } from '../interfaces/context/AuthContext';
import type { UserProfile } from '../interfaces/user';
import { loadEnv } from '../utils/loaderEnv';

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_URL = loadEnv('AUTH_URL');

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Verificar si hay sesión guardada al cargar
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('user_profile');
      
      if (token && savedUser) {
        try {
          const userProfile = JSON.parse(savedUser);
          setUser(userProfile);
          setProfile(userProfile);
        } catch (error) {
          console.error('Error parsing saved user:', error);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_profile');
        }
      }
      setLoading(false);
    };

    checkSession();
  }, []);

  const signUp = async (data: {
    nombre: string;
    apellido?: string;
    celular?: string;
    correo_electronico: string;
    contraseña: string;
    rol?: string;
  }) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${AUTH_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.correo_electronico,
          password: data.contraseña,
          nombre: data.nombre,
          apellido: data.apellido,
          celular: data.celular,
          rol: data.rol || 'cliente',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al registrar usuario');
      }

      // Si el registro fue exitoso, hacer login automático
      return await signIn({
        correo_electronico: data.correo_electronico,
        contraseña: data.contraseña,
      });
    } catch (error) {
      console.error('Error signing up:', error);
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (credentials: {
    correo_electronico: string;
    contraseña: string;
  }) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${AUTH_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.correo_electronico,
          password: credentials.contraseña,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Credenciales inválidas');
      }

      // Guardar token y perfil
      if (result.token) {
        localStorage.setItem('auth_token', result.token);
      }

      const userProfile: UserProfile = {
        id: result.user.id,
        nombre: result.user.nombre || result.user.name,
        apellido: result.user.apellido,
        correo_electronico: result.user.email || result.user.correo_electronico,
        celular: result.user.celular || result.user.phone,
        role: result.user.role || result.user.rol || 'USUARIO',
        activo: result.user.active ?? result.user.activo ?? true,
        created_at: result.user.created_at || new Date().toISOString(),
      };

      localStorage.setItem('user_profile', JSON.stringify(userProfile));
      setUser(userProfile);
      setProfile(userProfile);
      
      return { error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Limpiar localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_profile');
      
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    profile,
    session: null,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

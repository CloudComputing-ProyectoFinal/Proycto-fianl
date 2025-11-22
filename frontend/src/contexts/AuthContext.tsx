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
    firstName: string;
    lastName?: string;
    phoneNumber?: string;
    email: string;
    password: string;
    role?: string;
    address?: string;
  }) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${AUTH_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          role: data.role || 'USER',
          address: data.address,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al registrar usuario');
      }

      // Si el registro fue exitoso, hacer login automático con las credenciales proporcionadas
      return await signIn({
        email: data.email,
        password: data.password,
      });
    } catch (error) {
      console.error('Error signing up:', error);
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (credentials: {
    email: string;
    password: string;
  }) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${AUTH_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
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

      // Normalizar campos de usuario (aceptar userId/id y firstName/nombre)
      const userFromServer = result.user || {};
      const userProfile: UserProfile = {
        id: userFromServer.userId || userFromServer.id,
        nombre: userFromServer.firstName || userFromServer.nombre || userFromServer.name,
        apellido: userFromServer.lastName || userFromServer.apellido || '',
        correo_electronico: userFromServer.email || userFromServer.correo_electronico,
        celular: userFromServer.phoneNumber || userFromServer.celular || userFromServer.phone || '',
        role: (userFromServer.role || userFromServer.rol || 'USER').toUpperCase(),
        activo: userFromServer.active ?? userFromServer.activo ?? true,
        created_at: userFromServer.createdAt || userFromServer.created_at || new Date().toISOString(),
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

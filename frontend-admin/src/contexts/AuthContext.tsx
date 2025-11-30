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
    // Registro no disponible en la aplicación administrativa.
    // Dejamos una función stub para no romper consumos existentes desde componentes.
    setLoading(false);
    return { error: new Error('Registro no disponible') };
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
        throw new Error(result.error || result.message || result?.data?.message || 'Credenciales inválidas');
      }

      // Extraer payload flexible: muchas respuestas actuales vienen en { data: { user, token } }
      const payload = result?.data ?? result;

      // token puede estar en payload.token o en result.token
      const token = payload?.token || result?.token;
      if (token) localStorage.setItem('auth_token', token);

      // usuario puede estar en payload.user o result.user
      const userFromServer = payload?.user || result?.user || {};

      // Normalizar tenant id: tenant_id (snake_case) -> tenantId
      const tenantId = (userFromServer.tenantId || userFromServer.tenant_id || null) as string | null;

      // Normalizar role: mantendremos el texto original pero también evaluaremos por exclusión (Cliente)
      const rawRole = userFromServer.role || userFromServer.rol || '';

      // Rechazar acceso a usuarios tipo Cliente
      if (typeof rawRole === 'string' && /cliente/i.test(rawRole)) {
        throw new Error('No tienes permisos para acceder a esta aplicación. Esta es solo para personal administrativo.');
      }

      const userProfile: UserProfile = {
        id: userFromServer.userId || userFromServer.id || '',
        nombre: userFromServer.firstName || userFromServer.first_name || userFromServer.nombre || '',
        apellido: userFromServer.lastName || userFromServer.last_name || userFromServer.apellido || '',
        correo_electronico: userFromServer.email || userFromServer.correo_electronico || '',
        celular: userFromServer.phoneNumber || userFromServer.phone || userFromServer.celular || '',
        role: rawRole,
        activo: (userFromServer.status ? userFromServer.status === 'ACTIVE' : (userFromServer.active ?? true)),
        created_at: userFromServer.createdAt || userFromServer.created_at || new Date().toISOString(),
        updated_at: userFromServer.updatedAt || userFromServer.updated_at || new Date().toISOString(),
      } as UserProfile;

      // incluir tenantId si existe
      if (tenantId) (userProfile as any).tenantId = tenantId;

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

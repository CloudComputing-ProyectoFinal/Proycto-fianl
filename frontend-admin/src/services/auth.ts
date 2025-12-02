import { loadEnv } from '@/utils/loaderEnv';

const AUTH_URL = (() => {
  try {
    return loadEnv('AUTH_URL');
  } catch {
    return import.meta.env.VITE_API_URL_AUTH || '';
  }
})();

export async function login(credentials: { email: string; password: string }) {
  const res = await fetch(`${AUTH_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: credentials.email, password: credentials.password })
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Login error');
  return { token: json.token, user: json.user, message: json.message };
}

export async function register(data: { firstName: string; lastName?: string; phoneNumber?: string; email: string; password: string; role?: string; address?: string }) {
  const res = await fetch(`${AUTH_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      role: data.role || 'USER',
      address: data.address
    })
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Register error');
  return { token: json.token, user: json.user, message: json.message };
}

export default { login, register };

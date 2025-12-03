import type { AuthRegisterRequest, AuthRequest, AuthResponse } from "@/interfaces/context/AuthContext";
import { loadEnv } from "@/utils/loaderEnv";

const API_URL = loadEnv("AUTH_URL");

export const login = async (credentials: AuthRequest) => {
    const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
    });
    const json = await response.json();
    if (!response.ok) {
        // support nested message
        throw new Error(json?.message || json?.data?.message || 'Login failed');
    }

    // Normalize response: support both top-level and nested `data` responses
    const token = json.token || json?.data?.token;
    const user = json.user || json?.data?.user;
    return {
        message: json.message || json?.data?.message || '',
        token,
        user,
    } as AuthResponse;
}

export const register = async (data: AuthRegisterRequest) => {
    const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    const json = await response.json();
    if (!response.ok) {
        throw new Error(json?.message || json?.data?.message || 'Registration failed');
    }

    const token = json.token || json?.data?.token;
    const user = json.user || json?.data?.user;
    return {
        message: json.message || json?.data?.message || '',
        token,
        user,
    } as AuthResponse;
}

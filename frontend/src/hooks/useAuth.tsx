import { AuthContext } from "@/contexts/context";
import { useContext } from "react";

export default function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
}
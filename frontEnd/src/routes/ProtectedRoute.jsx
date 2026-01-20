// src/routes/ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://10.0.0.91:8001";

export default function ProtectedRoute() {
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [allowed, setAllowed] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function checkAuth() {
        try {
            const response = await fetch(`${API_URL}/me`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            });

            if (!response.ok) {
            // 401/403 -> não autenticado
            if (response.status === 401 || response.status === 403) {
                if (!cancelled) setAllowed(false);
                return;
            }

            throw new Error(`Erro ao validar sessão (status ${response.status})`);
            }

            if (!cancelled) setAllowed(true);
        } catch (err) {
            console.error("Auth check failed:", err);
            if (!cancelled) setAllowed(false);
        } finally {
            if (!cancelled) setLoading(false);
        }
        }

        checkAuth();
        return () => {
        cancelled = true;
        };
    }, []);

    if (loading) {
        return (
        <div style={{ padding: 16 }}>
            <p>Validando sessão...</p>
        </div>
        );
    }

    if (!allowed) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
}

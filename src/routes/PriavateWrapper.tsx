import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "../views/LoadingScreen";

export default function PrivateWrapper() {
    const { user, loading, isAuthorized } = useAuth();
    const location = useLocation();

    if (loading) {
        return <LoadingScreen />;
    }


    if (!user && location.pathname !== "/") {
        return <Navigate to="/" replace />;
    }

    if (user && !isAuthorized) {
        const allowedPaths = ["/home", "/acesso-negado", "/muagrometro"];
        if (!allowedPaths.includes(location.pathname)) {
            return <Navigate to="/acesso-negado" replace />;
        }
    }

    return <Outlet />;
}

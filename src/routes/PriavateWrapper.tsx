import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "../views/LoadingScreen";

export default function PrivateWrapper() {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <LoadingScreen />;
    }


    if (!user && location.pathname !== "/") {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

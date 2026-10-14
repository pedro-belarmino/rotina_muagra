import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isAdmin } from "../utils/admin";
import LoadingScreen from "../views/LoadingScreen";

export default function AdminWrapper() {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingScreen />;
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (!isAdmin(user.email)) {
        return <Navigate to="/home" replace />;
    }

    return <Outlet />;
}

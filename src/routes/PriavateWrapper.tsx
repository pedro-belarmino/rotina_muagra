import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "../views/LoadingScreen";

export default function PrivateWrapper() {
    const { user, loading, isAuthorized, isAuthorizedPartial } = useAuth();
    const location = useLocation();

    if (loading) {
        return <LoadingScreen />;
    }


    if (!user && location.pathname !== "/") {
        return <Navigate to="/" replace />;
    }

    if (user && !isAuthorized) {
        const allowedPaths = ["/home", "/acesso-negado", "/muagrometro"];

        const dashboardAuthorizedEmails = [
            "fabiomarcheriserrano@gmail.com",
            "pedro.gbelarmino@gmail.com"
        ];

        if (user.email && dashboardAuthorizedEmails.includes(user.email.toLowerCase())) {
            allowedPaths.push("/dashboard");
        }

        if (isAuthorizedPartial) {
            allowedPaths.push("/criar-tarefa");
        }

        if (!allowedPaths.includes(location.pathname)) {
            return <Navigate to="/acesso-negado" replace />;
        }
    }

    return <Outlet />;
}

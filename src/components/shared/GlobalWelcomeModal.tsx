import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import WelcomeModal from "./WelcomeModal";

// Renderizada no App (e não só no Login): a PhoneNumberModal aguarda a
// WelcomeModal fechar, então ela precisa aparecer em qualquer rota em que o
// usuário logado chegue (ex.: sessão persistida abrindo direto em /home).
export default function GlobalWelcomeModal() {
    const navigate = useNavigate();
    const { user, loading, showWelcomeModal, markWelcomeModalAsSeen } = useAuth();

    const handleClose = async () => {
        await markWelcomeModalAsSeen();
        navigate('/home');
    };

    return (
        <WelcomeModal
            open={!loading && !!user && showWelcomeModal}
            onClose={handleClose}
        />
    );
}

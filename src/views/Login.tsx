import { useAuth } from "../context/AuthContext";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "../firebase/config";

function App() {
    const { user, loading } = useAuth();

    const handleLogin = async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    };

    const handleLogout = async () => {
        await signOut(auth);
    };

    if (loading) return <p>Carregando...</p>;

    return (
        <div>
            {user ? (
                <>
                    <p>Bem-vindo, {user.displayName}</p>
                    <button onClick={handleLogout}>Sair</button>
                </>
            ) : (
                <button onClick={handleLogin}>Login com Google</button>
            )}
        </div>
    );
}

export default App;

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
    signInWithGoogle,
    createUserWithEmail,
    signInWithEmail,
    signOut,
} from "../service/authService";
import GoogleIcon from "@mui/icons-material/Google";
import {
    Box,
    Button,
    Typography,
    Avatar,
    Card,
    CardContent,
    CardActions,
    TextField,
    Alert,
    ToggleButtonGroup,
    ToggleButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { version } from "../../versioning";
import LoadingScreen from "./LoadingScreen";

function Login() {
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    const [isLoginMode, setIsLoginMode] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleGoogleLogin = async () => {
        try {
            setError("");
            await signInWithGoogle();
            navigate('/home');
        } catch (err) {
            setError("Falha ao fazer login com o Google. Tente novamente.");
            console.error(err);
        }
    };

    const handleEmailLogin = async () => {
        if (!email || !password) {
            setError("Por favor, preencha e-mail e senha.");
            return;
        }
        try {
            setError("");
            await signInWithEmail(email, password);
            navigate('/home');
        } catch (err) {
            setError("Credenciais inválidas. Verifique seu e-mail e senha.");
            console.error(err);
        }
    };

    const handleCreateAccount = async () => {
        if (!email || !password) {
            setError("Por favor, preencha e-mail e senha.");
            return;
        }
        if (password.length < 6) {
            setError("A senha deve ter no mínimo 6 caracteres.");
            return;
        }
        try {
            setError("");
            await createUserWithEmail(email, password);
            navigate('/home');
        } catch (err) {
            setError("Não foi possível criar a conta. Verifique o e-mail e tente novamente.");
            console.error(err);
        }
    };

    const handleLogout = async () => {
        await signOut();
    };

    const handleModeChange = (
        _event: React.MouseEvent<HTMLElement>,
        newMode: boolean | null
    ) => {
        if (newMode !== null) {
            setIsLoginMode(newMode);
            setError("");
        }
    };

    if (loading) return <LoadingScreen />;

    return (
        <Card
            sx={{
                maxWidth: 400,
                mx: "auto",
                mt: 4,
                p: 2,
                borderRadius: 3,
                boxShadow: 6,
                textAlign: "center",
            }}
        >
            <img
                src="/trilhaDoAgradecedor.png"
                alt="LogoTrilhaDoAgradecedor"
                style={{ width: 400, maxWidth: "100%" }}
            />
            <img
                src="/logo_semfundo.png"
                alt="Logo"
                style={{ width: 80, maxWidth: "100%" }}
            />

            <CardContent>
                {user ? (
                    <Box
                        display="flex"
                        flexDirection={{ xs: "column", sm: "row" }}
                        alignItems="center"
                        justifyContent="center"
                        sx={{ gap: 2 }}
                    >
                        <Box>
                            <Typography variant="h6" sx={{ mt: 1 }}>
                                Bem-vindo, {user.displayName}
                            </Typography>
                        </Box>
                        <Avatar
                            src={user.photoURL || ""}
                            alt={user.displayName || ""}
                            sx={{ width: 56, height: 56 }}
                        />
                    </Box>
                ) : (
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Acesse sua conta
                    </Typography>
                )}
            </CardContent>

            <CardActions
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    justifyContent: "center",
                }}
            >
                {user ? (
                    <Box sx={{ display: "flex", width: '100%', gap: 2 }}>
                        <Button
                            variant="contained"
                            color="warning"
                            fullWidth
                            onClick={() => navigate("/home")}
                        >
                            Entrar
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={handleLogout}
                            fullWidth
                        >
                            Sair da conta
                        </Button>
                    </Box>
                ) : (
                    <Box sx={{ width: '100%' }}>
                        <ToggleButtonGroup
                            value={isLoginMode}
                            exclusive
                            onChange={handleModeChange}
                            fullWidth
                            sx={{ mb: 2 }}
                        >
                            <ToggleButton value={true} color="primary">
                                Entrar
                            </ToggleButton>
                            <ToggleButton value={false} color="secondary">
                                Criar Conta
                            </ToggleButton>
                        </ToggleButtonGroup>

                        <TextField
                            label="E-mail"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            fullWidth
                            margin="normal"
                            variant="outlined"
                        />
                        <TextField
                            label="Senha"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            fullWidth
                            margin="normal"
                            variant="outlined"
                        />

                        {error && (
                            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                                {error}
                            </Alert>
                        )}

                        <Button
                            variant="contained"
                            onClick={isLoginMode ? handleEmailLogin : handleCreateAccount}
                            fullWidth
                            sx={{ mt: 2 }}
                        >
                            {isLoginMode ? "Entrar com E-mail" : "Criar Conta com E-mail"}
                        </Button>

                        <Typography sx={{ my: 2 }}>ou</Typography>

                        <Button
                            variant="contained"
                            onClick={handleGoogleLogin}
                            startIcon={<GoogleIcon />}
                            fullWidth
                        >
                            Entrar com Google
                        </Button>
                    </Box>
                )}
            </CardActions>
            <p style={{ fontSize: "small" }}>{version}</p>
        </Card>
    );
}

export default Login;

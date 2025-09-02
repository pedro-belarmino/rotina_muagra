import { useAuth } from "../context/AuthContext";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import GoogleIcon from '@mui/icons-material/Google';
import {
    Box, Button, Typography,
    //  Avatar,
    Card, CardContent, CardActions
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function App() {

    const navigate = useNavigate()
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
            <Typography variant="h5" fontWeight={'bold'} fontFamily={"Segoe UI Emoji"}>MUAGRA ROTINA</Typography>
            <br />
            <img
                src="/logo_semfundo.png"
                alt="Logo"
                style={{ width: 80, maxWidth: "100%" }}
            />
            <CardContent>
                {user ? (
                    <>
                        <Box
                            display="flex"
                            flexDirection={{ xs: "column", sm: "row" }}
                            alignItems="center"
                            justifyContent="center"
                            sx={{ gap: 2 }}
                        >
                            <Box>
                                <Typography
                                    variant="h6"
                                    sx={{ mt: 1 }}
                                >
                                    Bem-vindo, {user.displayName}
                                </Typography>
                            </Box>

                            {/* <Avatar
                                src={user.photoURL || ""}
                                alt={user.displayName || ''}
                                sx={{ width: 64, height: 64 }}
                            /> */}
                        </Box>
                    </>
                ) : (
                    <Typography
                        variant="h6"
                        sx={{ mb: 2 }}
                    >
                        Acesse sua conta
                    </Typography>
                )}
            </CardContent>

            <CardActions
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                    justifyContent: "center",
                }}
            >
                {user ? (
                    <>
                        <Button variant="contained" color="warning" fullWidth onClick={() => navigate('/home')}>
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
                    </>
                ) : (
                    <Button
                        variant="contained"
                        onClick={handleLogin}
                        startIcon={<GoogleIcon />}
                        fullWidth
                    >
                        Login com Google
                    </Button>
                )}
            </CardActions>
            <p>0.0.1</p>
        </Card>
    );
}

export default App;

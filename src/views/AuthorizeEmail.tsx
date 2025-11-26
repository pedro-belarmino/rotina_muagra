import { useState } from "react";
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Card,
    CardContent,
    CardActions,
} from "@mui/material";
import { addAuthorizedEmail, isEmailAuthorized } from "../service/authorizedEmailService";
import { useSnackbar } from "../context/SnackbarContext";

const AuthorizeEmail = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const { showSnackbar } = useSnackbar();

    const validateEmail = (email: string) => {
        if (!email) {
            setError("O e-mail é obrigatório.");
            return false;
        }
        if (!/^[^\s@]+@gmail\.com$/.test(email)) {
            setError("O e-mail deve ser um endereço @gmail.com válido.");
            return false;
        }
        setError("");
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateEmail(email)) {
            return;
        }

        try {
            const isAuthorized = await isEmailAuthorized(email);
            if (isAuthorized) {
                showSnackbar("Este e-mail já está autorizado.", "warning");
                return;
            }

            await addAuthorizedEmail(email);
            showSnackbar("E-mail autorizado com sucesso!", "success");
            setEmail("");
        } catch (err) {
            showSnackbar("Ocorreu um erro ao autorizar o e-mail.", "error");
        }
    };

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    marginTop: 8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <Card sx={{
                    minWidth: 400,
                    p: 2,
                    borderRadius: 3,
                    boxShadow: 6,
                }}>
                    <CardContent>
                        <Typography component="h1" variant="h5" align="center">
                            Autorizar Novo E-mail
                        </Typography>
                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Endereço de E-mail"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (error) {
                                        validateEmail(e.target.value);
                                    }
                                }}
                                error={!!error}
                                helperText={error}
                            />
                            <CardActions>
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    sx={{ mt: 3, mb: 2 }}
                                >
                                    Autorizar
                                </Button>
                            </CardActions>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
};

export default AuthorizeEmail;

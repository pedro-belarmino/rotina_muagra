import { Button, Container, Divider, Paper, Typography, useTheme } from "@mui/material";
import { useCounterController } from "./Counter.controller";
import { useNavigate } from "react-router-dom";

export default function Counter() {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    const { globalCount, userCount, selectedPhrase } = useCounterController()
    const { title, text } = selectedPhrase;
    const navigate = useNavigate()
    const formatGlobalCount = (num: number): string => {
        const padded = num.toString().padStart(7, "0");
        return padded.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    return (
        <Container
            maxWidth="sm"
            sx={{
                height: "90vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                py: 3
            }}>

            <div style={{ width: '100%', alignSelf: 'center' }}>
                {isDarkMode ? (
                    <img src="/Muagrômetro Global Branco Sem Número.png" style={{ width: "100%" }} />
                ) : (
                    <img src="/Muagrômetro Global Preto Sem número.png" style={{ width: "100%" }} />
                )}
            </div>
            <div>
                <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography textAlign={'center'} variant="h6" sx={{ display: 'flex', placeSelf: 'center' }}>
                        Nosso movimento já gerou
                    </Typography>

                    <Paper sx={{ p: 1, m: 2, textAlign: "center" }}>
                        <Typography fontWeight="bold" color="warning" variant="h3">
                            {formatGlobalCount(globalCount)}
                        </Typography>
                    </Paper>

                    <Typography variant="h5" sx={{ display: 'flex', placeSelf: 'center' }}>
                        Agradecimentos!
                    </Typography>
                </Paper>
                <br />
                <Typography
                    textAlign="center"
                    sx={{
                        fontSize: { xs: "1rem", sm: "1.2rem" },
                        lineHeight: 1.4,
                        px: 2,
                    }}
                >
                    Muagra pelos seus{" "}
                    <Typography
                        component="span"
                        sx={{
                            fontWeight: "bold",
                            color: "warning.main",
                            mx: 0.5,
                        }}
                    >
                        {userCount}
                    </Typography>
                    Agradecimentos de hoje
                </Typography>
                <br />
                <Typography textAlign={'center'} sx={{ display: 'flex', placeSelf: 'center' }}>
                    Parabéns e Muagra a todos nós.
                </Typography>
            </div>

            <div>
                <Paper variant="outlined" sx={{ p: 2, m: 2 }} id="frases">
                    <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" textAlign="center">
                        {title}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" color="text.secondary" textAlign="center" sx={{ mt: 2 }}>
                        {text}
                    </Typography>
                </Paper>
                <div style={{ display: "flex", justifyContent: "center" }}>

                    <Button
                        color="warning"
                        variant="contained"
                        onClick={() => navigate("/home")}
                        sx={{ mb: 2 }}
                    >
                        Voltar
                    </Button>
                </div>
            </div>
        </Container>
    );

}

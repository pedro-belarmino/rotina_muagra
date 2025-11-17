import { Button, Container, Divider, Paper, Typography, useTheme } from "@mui/material";
import { useConterController } from "./Counter.controller";
import { useNavigate } from "react-router-dom";

export default function Counter() {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    const { globalCount, phrases } = useConterController()
    const phraseList = typeof phrases === "function" ? phrases() : phrases || []
    const random = Math.floor(Math.random() * Math.max(1, phraseList.length))
    const { title, text } = phraseList[random] ?? { title: "", text: "" }
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

                <Button
                    color="warning"
                    variant="outlined"
                    onClick={() => navigate("/home")}
                    sx={{ width: "100%", mb: 2 }}
                >
                    Voltar
                </Button>
            </div>
        </Container>
    );

}

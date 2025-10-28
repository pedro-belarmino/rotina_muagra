import { Container, Paper, Typography, useTheme } from "@mui/material";
import { useConterController } from "./Counter.controller";

export default function Counter() {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    const { globalCount } = useConterController()

    // Função para aplicar a máscara 000.000.000.000.000
    const formatGlobalCount = (num: number): string => {
        // Garante que o número tenha 15 dígitos com zeros à esquerda
        const padded = num.toString().padStart(15, "0");
        // Adiciona pontos a cada 3 dígitos
        return padded.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }


    return (
        <Container maxWidth="sm" sx={{ mt: 3 }}>
            <div style={{ width: '70%', placeSelf: 'center' }}>

                {isDarkMode ? (
                    <img
                        src="/Muagrômetro Global Branco Sem Número.png"
                        style={{ width: "100%" }}

                    />
                ) : (
                    <img
                        src="/Muagrômetro Global Preto Sem número.png"
                        style={{ width: "100%" }}
                    />
                )}
            </div>

            <Paper sx={{ p: 2, m: 2, textAlign: "center" }}>
                <Typography fontWeight={"bold"} fontSize={"big"}>
                    {formatGlobalCount(globalCount)}
                </Typography>
            </Paper>
        </Container>
    )
}
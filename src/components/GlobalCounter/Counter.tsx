import { Container, Divider, Paper, Typography, useTheme } from "@mui/material";
import { useConterController } from "./Counter.controller";

export default function Counter() {
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';
    const { globalCount, phrases } = useConterController()
    const phraseList = typeof phrases === "function" ? phrases() : phrases || []
    const random = Math.floor(Math.random() * Math.max(1, phraseList.length))
    const { title, text } = phraseList[random] ?? { title: "", text: "" }


    const formatGlobalCount = (num: number): string => {
        const padded = num.toString().padStart(15, "0");
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



            <Paper variant="outlined" sx={{ p: 2, m: 2 }}>

                <Typography fontWeight="bold" textAlign="center">
                    {title}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography textAlign="center" sx={{ mt: 2 }}>
                    {text}
                </Typography>

            </Paper>

        </Container >
    )
}


import { Box, CircularProgress } from "@mui/material";

export default function LoadingScreen() {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress color="warning" size="3rem" />
        </Box>
    )
}
import { Dialog, DialogContent, DialogActions, Button, Typography, Box } from "@mui/material";

interface WelcomeModalProps {
    open: boolean;
    onClose: () => void;
}

export default function WelcomeModal({ open, onClose }: WelcomeModalProps) {
    return (
        <Dialog
            open={open}
            onClose={(_, reason) => {
                // Prevent closing by clicking outside or pressing escape
                if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
                    onClose();
                }
            }}
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    p: 2,
                    textAlign: 'center'
                }
            }}
        >
            <DialogContent>
                <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
                    <img
                        src="/logo_semfundo.png"
                        alt="Logo"
                        style={{ width: 80, maxWidth: "100%" }}
                    />
                    <Typography variant="body1" sx={{ fontWeight: 500, lineHeight: 1.6 }}>
                        Você está acessando uma ferramenta gratuita para aprender a treinar o Agradecimento e descobrir o poder que essa prática diária tem de equilibrar os principais pilares da sua vida.
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button
                    variant="contained"
                    color="warning"
                    onClick={onClose}
                    sx={{ px: 4, py: 1, borderRadius: 2, fontWeight: 'bold' }}
                >
                    Começar a agradecer!
                </Button>
            </DialogActions>
        </Dialog>
    );
}

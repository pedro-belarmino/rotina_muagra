import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    TextField,
    Typography,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { usePhoneNumberModalController } from "./PhoneNumberModal.controller";

function PhoneNumberDialog({ open }: { open: boolean }) {
    const {
        countryCode,
        number,
        fieldErrors,
        submitError,
        saving,
        handleCountryCodeChange,
        handleNumberChange,
        handleSubmit,
    } = usePhoneNumberModalController();

    return (
        <Dialog
            open={open}
            // Cadastro obrigatório: não fecha por clique fora nem Esc.
            disableEscapeKeyDown
            fullWidth
            maxWidth="xs"
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    p: { xs: 1, sm: 2 },
                    textAlign: 'center'
                }
            }}
        >
            <Box
                component="form"
                noValidate
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                }}
            >
                <DialogContent>
                    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                        <img
                            src="/logo_semfundo.png"
                            alt="Logo"
                            style={{ width: 80, maxWidth: "100%" }}
                        />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            Cadastre seu número de WhatsApp
                        </Typography>
                        <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                            Precisamos do seu celular para habilitar todas as funcionalidades do sitema, manter seu cadastro atualizado e entrar em contato com você quando necessário.
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, width: '100%', alignItems: 'flex-start' }}>
                            <TextField
                                label="País"
                                value={countryCode}
                                onChange={(e) => handleCountryCodeChange(e.target.value)}
                                error={!!fieldErrors.countryCode}
                                helperText={fieldErrors.countryCode ?? "Ex.: +55"}
                                disabled={saving}
                                required
                                sx={{ width: 110, flexShrink: 0 }}
                                inputProps={{ inputMode: 'tel', autoComplete: 'tel-country-code', 'aria-label': 'Código do país' }}
                            />
                            <TextField
                                label="Celular"
                                value={number}
                                onChange={(e) => handleNumberChange(e.target.value)}
                                error={!!fieldErrors.number}
                                helperText={fieldErrors.number ?? "Com DDD/código de área"}
                                disabled={saving}
                                required
                                fullWidth
                                autoFocus
                                inputProps={{ inputMode: 'tel', autoComplete: 'tel-national' }}
                            />
                        </Box>

                        {submitError && (
                            <Alert severity="error" sx={{ width: '100%', textAlign: 'left' }}>
                                {submitError}
                            </Alert>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="warning"
                        disabled={saving}
                        startIcon={saving ? <CircularProgress size={18} color="inherit" /> : undefined}
                        sx={{ px: 4, py: 1, borderRadius: 2, fontWeight: 'bold' }}
                    >
                        {saving ? "Salvando..." : "Salvar número"}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}

export default function PhoneNumberModal() {
    const { user, loading, needsPhoneNumber, showWelcomeModal } = useAuth();

    if (loading || !user) return null;

    // key por uid: o formulário é recriado do zero em troca de conta.
    // A WelcomeModal tem prioridade; o telefone é pedido logo após ela fechar.
    return (
        <PhoneNumberDialog
            key={user.uid}
            open={needsPhoneNumber && !showWelcomeModal}
        />
    );
}

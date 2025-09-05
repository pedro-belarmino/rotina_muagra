import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

export type SeverityType = 'error' | 'success' | 'info' | 'warning';
type VariantType = 'filled' | 'outlined' | 'standard';

interface SharedSnackbarProps {
    open: boolean;
    message: string;
    severity?: SeverityType;
    variant?: VariantType;
    onClose: () => void;
}

export default function SharedSnackbar({
    open,
    message,
    severity = 'info',
    variant = 'filled',
    onClose
}: SharedSnackbarProps) {
    return (
        <Snackbar open={open} autoHideDuration={5000} onClose={onClose}>
            <Alert onClose={onClose} severity={severity} variant={variant} sx={{ width: '100%' }}>
                {message}
            </Alert>
        </Snackbar>
    );
}

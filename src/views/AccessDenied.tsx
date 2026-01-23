import React from 'react';
import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LockIcon from '@mui/icons-material/Lock';

const AccessDenied: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        borderRadius: 2,
                        textAlign: 'center'
                    }}
                >
                    <LockIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
                    <Typography variant="h4" component="h1" gutterBottom>
                        Acesso Restrito
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                        Você não tem permissão para acessar outras páginas além da Home.
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate('/home')}
                        sx={{ mt: 2 }}
                    >
                        Voltar à Home
                    </Button>
                </Paper>
            </Box>
        </Container>
    );
};

export default AccessDenied;

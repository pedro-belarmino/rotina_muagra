import { Box, Card, CardContent, Typography, Skeleton } from "@mui/material";
import { usePhasesController } from "./Phases.controller";

export default function Phases({ refreshTrigger }: { refreshTrigger?: any }) {
    const { phases, loading } = usePhasesController(refreshTrigger);

    const total = phases.reduce((acc, e) => {
        const value = e.accumulatedValue >= e.target
            ? e.target
            : e.accumulatedValue;

        return acc + value;
    }, 0);
    if (loading) {
        return (
            <Card sx={{ mb: 2, borderRadius: 3, boxShadow: 1, p: 1.5 }}>
                <CardContent>
                    <Skeleton variant="text" width={150} height={30} sx={{ mb: 2 }} />
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: 'repeat(4, 1fr)', md: 'repeat(8, 1fr)' },
                            gap: 2,
                        }}
                    >
                        {[...Array(8)].map((_, i) => (
                            <Box key={i} sx={{ textAlign: 'center' }}>
                                <Skeleton variant="rectangular" width={40} height={40} sx={{ mx: 'auto', borderRadius: 2 }} />
                                <Skeleton variant="text" width={30} sx={{ mx: 'auto', mt: 1 }} />
                            </Box>
                        ))}
                    </Box>
                </CardContent>
            </Card>
        );
    }


    return (
        <Card sx={{ mb: 2, borderRadius: 3, boxShadow: 1, p: 1.5 }}>
            <CardContent sx={{ py: 1, "&:last-child": { pb: 1 } }}>
                <Typography variant="h6" sx={{ mb: 2 }} textAlign='center'>
                    <b>Trilha do Agradecedor</b> - Suas Fases Conquistadas
                </Typography>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: 'repeat(4, 1fr)', md: 'repeat(8, 1fr)' },
                        gap: 1,
                        alignItems: 'start'
                    }}
                >
                    {phases.map((phase) => (
                        <Box key={phase.key} sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                        }}>
                            <Box
                                component="img"
                                src={phase.iconPath}
                                sx={{
                                    width: { xs: 45, sm: 55, md: 65 },
                                    height: 'auto',
                                    mb: 0.5,
                                }}
                                alt={phase.label}
                            />
                            <Typography
                                variant="body2"
                                fontWeight="bold"
                                color={phase.isTargetReached ? "warning.main" : "text.primary"}
                                sx={{ fontSize: '0.85rem' }}
                            >
                                {phase.accumulatedValue >= phase.target ? phase.target : phase.accumulatedValue}
                            </Typography>
                            {phase.dateReached ? (
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                    {phase.dateReached}
                                </Typography>
                            ) : (
                                <Box sx={{ height: '12px' }} /> /* Spacer to keep layout consistent */
                            )}
                        </Box>
                    ))}
                </Box>
                <Typography
                    variant="subtitle2"
                    color="textSecondary"
                    paddingTop={2}
                    sx={{ textAlign: 'right' }}
                >
                    Total de Agradecimentos (acumulado):{" "}
                    <Box
                        component="span"
                        sx={{ color: "warning.main", fontWeight: "bold" }}
                    >
                        {total}
                    </Box>
                </Typography>
            </CardContent>
        </Card >
    );
}

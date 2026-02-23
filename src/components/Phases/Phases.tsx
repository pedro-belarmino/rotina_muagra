import { Box, Card, CardContent, Typography, Skeleton } from "@mui/material";
import { usePhasesController } from "./Phases.controller";

export default function Phases({ refreshTrigger }: { refreshTrigger?: any }) {
    const { phases, loading } = usePhasesController(refreshTrigger);

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
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    Trilha do Agradecimento
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
                                    width: { xs: 45, sm: 55, md: 45 },
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
                                {phase.accumulatedValue}
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
            </CardContent>
        </Card>
    );
}

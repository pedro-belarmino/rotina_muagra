import { Paper, Box, Typography, Skeleton } from "@mui/material";
import { usePhasesController } from "./Phases.controller";

export default function Phases() {
    const { phases, loading } = usePhasesController();

    if (loading) {
        return (
            <Paper sx={{ p: 2, mb: 2, borderRadius: 3, boxShadow: 1 }}>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(4, 1fr)', md: 'repeat(8, 1fr)' },
                    gap: 1
                }}>
                    {[...Array(8)].map((_, i) => (
                        <Box key={i} sx={{ textAlign: 'center' }}>
                            <Skeleton variant="circular" width={40} height={40} sx={{ mx: 'auto' }} />
                            <Skeleton variant="text" width={20} sx={{ mx: 'auto' }} />
                        </Box>
                    ))}
                </Box>
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 2, mb: 2, borderRadius: 3, boxShadow: 1 }}>
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: {
                    xs: 'repeat(4, 1fr)',
                    md: 'repeat(8, 1fr)'
                },
                gap: { xs: 1, md: 1 },
                justifyItems: 'center',
                alignItems: 'start'
            }}>
                {phases.map((phase) => {
                    const isReached = phase.target !== null && phase.value >= phase.target;
                    const showValue = phase.name !== 'guardiao' && phase.name !== 'infinito';

                    return (
                        <Box key={phase.name} sx={{
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: '100%',
                            minHeight: 80
                        }}>
                            <img
                                src={phase.isNextPhaseCreated ? `/icons/${phase.name}.png` : `/icons-pb/${phase.name}.png`}
                                alt={phase.label}
                                style={{
                                    width: '100%',
                                    maxWidth: 45,
                                    height: 'auto',
                                    objectFit: 'contain'
                                }}
                            />

                            {showValue && (
                                <Typography
                                    variant="body2"
                                    fontWeight="bold"
                                    color={isReached ? 'warning.main' : 'text.primary'}
                                    sx={{ mt: 0.5, fontSize: '0.85rem' }}
                                >
                                    {phase.value}
                                </Typography>
                            )}

                            {showValue && phase.reachedDate && (
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontSize: '0.65rem', lineHeight: 1, display: 'block' }}
                                >
                                    {phase.reachedDate}
                                </Typography>
                            )}
                        </Box>
                    );
                })}
            </Box>
        </Paper>
    );
}

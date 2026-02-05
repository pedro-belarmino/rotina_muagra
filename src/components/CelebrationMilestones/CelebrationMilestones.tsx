import { Box, Card, CardContent, Typography, Skeleton } from "@mui/material";
import { useCelebrationMilestonesController } from "./CelebrationMilestones.controller";

export default function CelebrationMilestones() {
    const { milestones, loading } = useCelebrationMilestonesController();

    if (loading) {
        return (
            <Card sx={{ mb: 2, borderRadius: 3, boxShadow: 1, p: 1.5 }}>
                <CardContent>
                    <Skeleton variant="text" width={150} height={30} sx={{ mb: 2 }} />
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
                            gap: 2,
                        }}
                    >
                        {[...Array(8)].map((_, i) => (
                            <Box key={i} sx={{ textAlign: 'center' }}>
                                <Skeleton variant="rectangular" width={60} height={60} sx={{ mx: 'auto', borderRadius: 2 }} />
                                <Skeleton variant="text" width={80} sx={{ mx: 'auto', mt: 1 }} />
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
                    Marcos de Celebração
                </Typography>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
                        gap: 2,
                    }}
                >
                    {milestones.map((m) => (
                        <Box key={m.value} sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            mb: 1
                        }}>
                            <Box
                                component="img"
                                src={m.reachedDate
                                    ? `/Insígnias/Normal/${m.image}.png`
                                    : `/Insígnias/Bloqueadas/${m.image} bloq.png`
                                }
                                sx={{
                                    width: { xs: 70, sm: 85 },
                                    height: 'auto',
                                    mb: 0.5,
                                }}
                                alt={m.label}
                            />
                            <Typography variant="caption" sx={{ fontSize: '0.75rem', lineHeight: 1.2, fontWeight: 500 }}>
                                {m.label}
                            </Typography>
                            {m.reachedDate ? (
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                    {m.reachedDate}
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

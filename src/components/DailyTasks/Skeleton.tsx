import { Box, Card, Container, Skeleton, Stack } from "@mui/material";

export const DailyTasksSkeleton = () => (
    <Container maxWidth="sm" sx={{ py: 3 }}>
        {/* Header Skeleton */}
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
            <Skeleton variant="text" width="60%" height={30} />
            <Skeleton variant="text" width="30%" height={20} />
        </Stack>

        {/* Card do Contador (Muagrômetro) */}
        <Card sx={{ mb: 2, borderRadius: 3, p: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Skeleton variant="rectangular" width={300} height={60} sx={{ borderRadius: 2 }} />
                <Skeleton variant="text" width="20%" height={50} />
                <Skeleton variant="rounded" width="100%" height={45} />
                <Skeleton variant="rounded" width="100%" height={45} />
                <Skeleton variant="rounded" width="100%" height={45} />
            </Box>
        </Card>

        {/* Card de Progresso (Mensal/Anual) */}
        <Card sx={{ mb: 2, borderRadius: 3, p: 2 }}>
            <Stack direction="row" justifyContent="space-around">
                <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Skeleton variant="text" width={80} />
                    <Skeleton variant="circular" width={40} height={40} sx={{ my: 1 }} />
                    <Skeleton variant="text" width={60} />
                </Box>
                <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Skeleton variant="text" width={80} />
                    <Skeleton variant="circular" width={40} height={40} sx={{ my: 1 }} />
                    <Skeleton variant="text" width={60} />
                </Box>
            </Stack>
        </Card>

        {/* Listagem de Tarefas (Simulando 2 cards) */}
        {[1, 2].map((i) => (
            <Card key={i} sx={{ mb: 2, borderRadius: 3, p: 2 }}>
                <Stack direction="row" spacing={2}>
                    <Box sx={{ flex: 2 }}>
                        <Skeleton variant="text" width="50%" height={30} />
                        <Skeleton variant="text" width="80%" sx={{ mb: 2 }} />
                        <Skeleton variant="text" width="100%" height={10} />
                        <Skeleton variant="text" width="100%" height={10} />
                    </Box>
                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                        <Skeleton variant="circular" width={60} height={60} />
                    </Box>
                </Stack>
            </Card>
        ))}
    </Container>
);
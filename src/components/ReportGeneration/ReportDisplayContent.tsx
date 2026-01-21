
import {
    Paper,
    Typography,
    Box,
    LinearProgress,
} from "@mui/material";

import { LineChart } from "@mui/x-charts/LineChart";
import type { Key } from "react";

interface ReportDisplayContentProps {
    data: any;
}

export default function ReportDisplayContent({
    data,
}: ReportDisplayContentProps) {
    if (!data) return null;

    return (
        <>
            <Paper sx={{ p: 3, mt: 2, borderRadius: 2 }}>
                <Typography variant="h6" color="textSecondary">Balanço Geral</Typography>
                <Typography variant="h3" fontWeight="bold" color="warning.main">
                    {data.generalBalance.toFixed(2)}%
                </Typography>
            </Paper>

            <Paper sx={{ p: 3, mt: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>Gráfico de Agradecimentos</Typography>
                <Box sx={{ height: 350, width: '100%' }}>
                    <LineChart
                        xAxis={[{
                            scaleType: 'point',
                            data: data.counters.map((c: { dateKey: any; }) => c.dateKey)
                        }]}
                        series={[{
                            data: data.counters.map((c: { value: any; }) => c.value),
                            color: '#ed6c02' // warning.main color
                        }]}
                        height={300}
                    />
                </Box>
            </Paper>

            <Paper sx={{ p: 3, mt: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>Balanço por Tarefa</Typography>

                <Box
                    sx={{
                        mt: 2,
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                        gap: 3,
                    }}
                >
                    {data.taskBalances.map((task: {
                        id: Key | null | undefined;
                        name: any;
                        totalGoal: any;
                        totalDone: any;
                        percentage: number;
                    }) => (
                        <Paper
                            key={task.id}
                            variant="outlined"
                            sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}
                        >
                            <Typography variant="subtitle1" fontWeight="bold">
                                {task.name}
                            </Typography>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                <Typography variant="body2" color="textSecondary">
                                    Meta: <strong>{task.totalGoal}</strong>
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Feito: <strong>{task.totalDone}</strong>
                                </Typography>
                            </Box>

                            <Box sx={{ mt: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="body2">Progresso</Typography>
                                    <Typography variant="body2" fontWeight="bold">
                                        {task.percentage.toFixed(2)}%
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    color="warning"
                                    variant="determinate"
                                    value={Math.min(100, Number(task.percentage.toFixed(2)))}
                                    sx={{ height: 8, borderRadius: 4 }}
                                />
                            </Box>
                        </Paper>
                    ))}
                </Box>
            </Paper>
        </>
    );
}

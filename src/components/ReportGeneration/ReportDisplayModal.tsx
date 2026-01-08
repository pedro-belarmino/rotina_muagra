
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Paper,
    Typography,
    Box,
    LinearProgress,
} from "@mui/material";

import { LineChart } from "@mui/x-charts/LineChart";
import type { Key } from "react";

interface ReportDisplayModalProps {
    open: boolean;
    onClose: () => void;
    data: any;
}

export default function ReportDisplayModal({
    open,
    onClose,
    data,
}: ReportDisplayModalProps) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
            <DialogTitle>Relatório da Trilha</DialogTitle>
            <DialogContent>
                {data && (
                    <>
                        <Paper sx={{ p: 3, mt: 2 }}>
                            <Typography variant="h6">Balanço Geral</Typography>
                            <Typography variant="h4">{data.generalBalance.toFixed(2)}%</Typography>
                        </Paper>
                        <Paper sx={{ p: 3, mt: 3 }}>
                            <Typography variant="h6">Gráfico de Agradecimentos</Typography>
                            <Box sx={{ height: 300 }}>
                                <LineChart
                                    xAxis={[{ scaleType: 'point', data: data.counters.map((c: { dateKey: any; }) => c.dateKey) }]}
                                    series={[{ data: data.counters.map((c: { value: any; }) => c.value) }]}
                                />
                            </Box>
                        </Paper>
                        <Paper sx={{ p: 3, mt: 3 }}>
                            <Typography variant="h6">Balanço por Tarefa</Typography>

                            <Box
                                sx={{
                                    mt: 2,
                                    columnCount: { xs: 1, md: 2 },
                                    columnGap: 3,
                                }}
                            >
                                {data.taskBalances.map((task: {
                                    id: Key | null | undefined;
                                    name: any;
                                    totalGoal: any;
                                    totalDone: any;
                                    percentage: number;
                                }) => (
                                    <Box
                                        key={task.id}
                                        sx={{
                                            breakInside: "avoid",
                                            mb: 2,
                                        }}
                                    >
                                        <Typography variant="body1">
                                            <strong>{task.name}</strong>
                                        </Typography>

                                        <Typography variant="body2">
                                            Meta: {task.totalGoal} | Feito: {task.totalDone}
                                        </Typography>

                                        <Typography variant="body2">
                                            Progresso: {task.percentage.toFixed(2)}%
                                        </Typography>

                                        <LinearProgress
                                            color="warning"
                                            variant="determinate"
                                            value={Number(task.percentage.toFixed(2))}
                                        />
                                    </Box>
                                ))}
                            </Box>
                        </Paper>

                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Fechar</Button>
            </DialogActions>
        </Dialog>
    );
}

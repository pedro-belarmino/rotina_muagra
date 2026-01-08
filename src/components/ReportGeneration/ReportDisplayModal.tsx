
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Paper,
    Typography,
    Box,
} from "@mui/material";

import { LineChart } from "@mui/x-charts/LineChart";

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
            <DialogTitle>Relatório Gerado</DialogTitle>
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
                                    xAxis={[{ scaleType: 'point', data: data.counters.map(c => c.dateKey) }]}
                                    series={[{ data: data.counters.map(c => c.value) }]}
                                />
                            </Box>
                        </Paper>
                        <Paper sx={{ p: 3, mt: 3 }}>
                            <Typography variant="h6">Balanço por Tarefa</Typography>
                            {data.taskBalances.map(task => (
                                <Box key={task.id} sx={{ mt: 2 }}>
                                    <Typography variant="body1"><strong>{task.name}</strong></Typography>
                                    <Typography variant="body2">Meta: {task.totalGoal} | Feito: {task.totalDone}</Typography>
                                    <Typography variant="body2">Progresso: {task.percentage.toFixed(2)}%</Typography>
                                </Box>
                            ))}
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

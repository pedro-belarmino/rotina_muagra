
import {
    Container,
    Typography,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    Divider,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Paper,
    Box,

} from "@mui/material";
import { useHistoryDisplayController } from "./HistoryDisplay.controller";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

export default function HistoryDisplay() {

    const {
        taskStats,
        tasks,
        expanded,
        counterAll,
        counterTotal,
        handleChange,
    } = useHistoryDisplayController()

    if (counterTotal == 0 && (Array.isArray(taskStats) ? taskStats.length == 0 : Object.keys(taskStats).length == 0)) return (
        <Container maxWidth="sm" sx={{ py: 3 }}>
            <Container component={Paper} sx={{ margin: 4, placeSelf: "center" }}>
                <Typography
                    fontSize={20}
                    sx={{ justifyContent: "center", display: "flex", p: 1 }}
                >
                    Seu histórico está vazio.
                </Typography>
            </Container>
        </Container>
    )

    return (
        <>
            <Container maxWidth="sm" sx={{ py: 3 }}>
                <Typography variant="h5" align="center" gutterBottom fontWeight="bold">
                    Histórico por Tarefa
                </Typography>
                {counterTotal > 0 && (
                    <Card
                        variant="outlined"
                        sx={{
                            mb: 3,
                            borderRadius: 3,
                            p: 3,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                        }}
                    >
                        {/* Total */}
                        <Box sx={{ mb: 2, textAlign: "center" }}>
                            <Typography variant="h4" fontWeight="bold" color="warning">
                                {counterTotal}
                            </Typography>
                            <Typography variant="subtitle2" color="textSecondary">
                                Total de agradecimentos
                            </Typography>
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        {/* Histórico detalhado */}
                        {counterAll?.map((item, index) => (
                            <Accordion key={index} sx={{ borderRadius: 2, mb: 1, boxShadow: "none" }}>
                                <AccordionSummary
                                    expandIcon={<KeyboardArrowUpIcon />}
                                    sx={{
                                        borderRadius: 2,
                                        px: 2,
                                        py: 1,
                                    }}
                                >
                                    <Typography variant="body1" fontWeight="medium">
                                        Ver todos os registros
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails sx={{ borderRadius: 2, px: 2 }}>
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                        <Typography variant="body2" color="textSecondary">
                                            <strong>Data:</strong> {item.dateKey}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            <strong>Valor:</strong> {item.value}
                                        </Typography>
                                    </Box>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Card>
                )}

                {Object.entries(taskStats).map(([taskId, stats]) => {
                    const task = tasks[taskId];
                    return (
                        <Card key={taskId} sx={{ mb: 3, borderRadius: 3, boxShadow: 2 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {task?.name || "Tarefa sem nome"}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Criada em:{" "}
                                    {task?.createdAt
                                        ? new Date(task.createdAt).toLocaleDateString()
                                        : "-"}
                                </Typography>

                                <Typography><b>Dias totais:</b> {stats.totalDays}</Typography>
                                <Typography><b>Dias seguidos:</b> {stats.streak}</Typography>
                                {task.measure != '' && (

                                    <Typography>
                                        <b>Meta total alcançada:</b> {stats.totalMeasure} {task?.measure}
                                    </Typography>
                                )}
                                <Divider sx={{ my: 2 }} />
                                <Accordion
                                    component={Paper}
                                    elevation={5}
                                    expanded={expanded === `panel${taskId}`}
                                    onChange={handleChange(`panel${taskId}`)}
                                >
                                    <AccordionSummary>
                                        <Typography component="span">Logs:</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <List dense>
                                            {stats.logs
                                                .sort(
                                                    (a, b) =>
                                                        new Date(b.doneAt).getTime() -
                                                        new Date(a.doneAt).getTime()
                                                )
                                                .map((log) => (
                                                    <ListItem key={log.id}>
                                                        <ListItemText
                                                            primary={new Date(log.doneAt).toLocaleString()}
                                                            secondary={task.measure != '' && `${log.value} ${task?.measure}`}
                                                        />
                                                    </ListItem>
                                                ))}
                                        </List>
                                    </AccordionDetails>
                                </Accordion>
                            </CardContent>
                        </Card>
                    );
                })}
            </Container>


        </>
    );
}

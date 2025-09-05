
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

} from "@mui/material";
import { useHistoryDisplayController } from "./HistoryDisplay.controller";



export default function HistoryDisplay() {

    const {
        taskStats,
        tasks,
        expanded,

        handleChange,
    } = useHistoryDisplayController()

    return (
        <>
            <Container maxWidth="sm" sx={{ py: 3 }}>
                <Typography variant="h5" align="center" gutterBottom fontWeight="bold">
                    Histórico por Tarefa
                </Typography>

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
                                <Typography>
                                    <b>Medida total:</b> {stats.totalMeasure} {task?.measure}
                                </Typography>

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
                                                            primary={`${log.value} ${task?.measure}`}
                                                            secondary={new Date(log.doneAt).toLocaleString()}
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

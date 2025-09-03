import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getTasks } from "../service/taskService";
import { getAllTaskLogs } from "../service/taskLogService";
import type { Task } from "../types/Task";
import type { TaskLog } from "../types/TaskLog";

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

type TaskStats = {
    totalDays: number;
    streak: number;
    totalMeasure: number;
    taskName: string;
    logs: TaskLog[];
};

function History() {
    const { user } = useAuth();
    const [taskStats, setTaskStats] = useState<Record<string, TaskStats>>({});
    const [tasks, setTasks] = useState<Record<string, Task>>({});
    const [expanded, setExpanded] = useState<string | false>(false);

    const handleChange =
        (panel: string) => (_event: React.SyntheticEvent, newExpanded: boolean) => {
            setExpanded(newExpanded ? panel : false);
        };

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            const [allLogs, allTasks] = await Promise.all([
                getAllTaskLogs(user.uid),
                getTasks(user.uid, true), // 🔑 agora inclui arquivadas
            ]);


            // Map taskId -> task
            const taskMap: Record<string, Task> = {};
            allTasks.forEach((t: Task) => {
                if (t.id) {
                    taskMap[t.id] = t;
                }
            });
            setTasks(taskMap);

            // Group logs by task
            const statsByTask: Record<string, TaskStats> = {};

            allLogs.forEach((log: TaskLog) => {
                if (!statsByTask[log.taskId]) {
                    statsByTask[log.taskId] = {
                        totalDays: 0,
                        streak: 0,
                        totalMeasure: 0,
                        taskName: '',
                        logs: [],
                    };
                }
                statsByTask[log.taskId].logs.push(log);
            });

            // Calculate stats for each task
            Object.entries(statsByTask).forEach(([_taskId, stats]) => {
                // Unique days
                const dates = new Set(
                    stats.logs.map((l) =>
                        new Date(l.doneAt).toDateString()
                    )
                );
                stats.totalDays = dates.size;

                // Streak calculation
                const sortedDates = [...dates]
                    .map((d) => {
                        const date = new Date(d);
                        date.setHours(0, 0, 0, 0);
                        return date;
                    })
                    .sort((a, b) => b.getTime() - a.getTime());

                let streak = 0;
                let today = new Date();
                today.setHours(0, 0, 0, 0);

                for (const d of sortedDates) {
                    if (d.getTime() === today.getTime()) {
                        streak++;
                        today.setDate(today.getDate() - 1);
                    } else {
                        break;
                    }
                }
                stats.streak = streak;

                // Total measure
                stats.totalMeasure = stats.logs.reduce(
                    (sum, l) => sum + l.value,
                    0
                );
            });

            setTaskStats(statsByTask);
        };

        fetchData();
    }, [user]);

    return (
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
    );
}

export default History;

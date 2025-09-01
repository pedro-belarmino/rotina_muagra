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
} from "@mui/material";

type TaskStats = {
    totalDays: number;
    streak: number;
    totalMeasure: number;
    logs: TaskLog[];
};

function History() {
    const { user } = useAuth();
    const [taskStats, setTaskStats] = useState<Record<string, TaskStats>>({});
    const [tasks, setTasks] = useState<Record<string, Task>>({});

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            const [allLogs, allTasks] = await Promise.all([
                getAllTaskLogs(user.uid),
                getTasks(user.uid),
            ]);

            // map taskId -> task
            const taskMap: Record<string, Task> = {};
            allTasks.forEach((t: any) => {
                taskMap[t.id!] = t;
            });
            setTasks(taskMap);

            // Agrupar logs por tarefa
            const statsByTask: Record<string, TaskStats> = {};

            allLogs.forEach((log: any) => {
                if (!statsByTask[log.taskId]) {
                    statsByTask[log.taskId] = {
                        totalDays: 0,
                        streak: 0,
                        totalMeasure: 0,
                        logs: [],
                    };
                }
                statsByTask[log.taskId].logs.push(log);
            });

            // Calcular stats por tarefa
            Object.entries(statsByTask).forEach(([_taskId, stats]) => {
                // dias totais (dias únicos em que houve log)
                const dates = new Set(
                    stats.logs.map((l) => new Date(l.doneAt).toDateString())
                );
                stats.totalDays = dates.size;

                // streak
                const sortedDates = [...dates]
                    .map((d) => new Date(d))
                    .sort((a, b) => b.getTime() - a.getTime());

                let streak = 0;
                let currentDate = new Date();
                for (const d of sortedDates) {
                    if (d.toDateString() === currentDate.toDateString()) {
                        streak++;
                        currentDate.setDate(currentDate.getDate() - 1);
                    } else if (
                        d.toDateString() ===
                        new Date(currentDate.setDate(currentDate.getDate() - 1)).toDateString()
                    ) {
                        streak++;
                    } else {
                        break;
                    }
                }
                stats.streak = streak;

                // medida total
                stats.totalMeasure = stats.logs.reduce((sum, l) => sum + l.value, 0);
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

                            <Typography variant="subtitle2">Logs:</Typography>
                            <List dense>
                                {stats.logs.map((log) => (
                                    <ListItem key={log.id}>
                                        <ListItemText
                                            primary={`${log.value} ${task?.measure}`}
                                            secondary={new Date(log.doneAt).toLocaleString()}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                );
            })}
        </Container>
    );
}

export default History;

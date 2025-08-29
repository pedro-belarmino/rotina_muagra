import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getTasks } from "../service/taskService";
import { addTaskLog, deleteTaskLog, getTaskLogByDate } from "../service/taskLogService";
import type { Task } from "../types/Task";

import {
    Container,
    Typography,
    List,
    ListItem,
    ListItemText,
    Button,
    Card,
    CardContent,
} from "@mui/material";
import LoadingScreen from "../views/LoadingScreen";

function DailyTasks() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false)
    const [doneToday, setDoneToday] = useState<Record<string, string | null>>({});
    // taskId -> logId se concluída, null se não

    useEffect(() => {
        const fetchTasks = async () => {
            setLoading(true)
            if (!user) return;

            const userTasks = await getTasks(user.uid);

            // ordenar pelo horário (ex: "08:30", "14:00")
            userTasks.sort((a, b) => {
                const [ah, am] = a.schedule.split(":").map(Number);
                const [bh, bm] = b.schedule.split(":").map(Number);
                return ah * 60 + am - (bh * 60 + bm);
            });

            setTasks(userTasks);


            // também buscar se já foi concluída hoje
            const today = new Date().toISOString().split("T")[0];
            const status: Record<string, string | null> = {};

            for (const task of userTasks) {
                const log = await getTaskLogByDate(user.uid, task.id!, today);
                status[task.id!] = log ? log.id! : null;
            }

            setDoneToday(status);
            setLoading(false)
        };

        fetchTasks();
    }, [user]);

    const handleToggleTask = async (task: Task) => {
        if (!user || !task.id) return;

        const logId = doneToday[task.id];

        if (logId) {
            // já concluída -> desmarcar (remover log)
            await deleteTaskLog(user.uid, logId);
            setDoneToday((prev) => ({ ...prev, [task.id!]: null }));
        } else {
            const value = task.dailyGoal; // depois entra modal
            const newLogId = await addTaskLog(user.uid, {
                taskId: task.id!,
                doneAt: new Date(),
                value,
            });
            setDoneToday((prev) => ({ ...prev, [task.id!]: newLogId }));
        }
    };


    if (loading) return <LoadingScreen />
    return (
        <Container maxWidth="sm" sx={{ py: 3 }}>
            <Typography
                variant="h5"
                align="center"
                gutterBottom
                fontWeight="bold"
            >
                Minhas Tarefas do Dia
            </Typography>

            <List>
                {tasks.map((task) => (
                    <Card
                        key={task.id}
                        sx={{
                            mb: 2,
                            borderRadius: 3,
                            boxShadow: 2,
                        }}
                    >
                        <CardContent>
                            <ListItem
                                disableGutters
                                secondaryAction={
                                    <Button
                                        variant="contained"
                                        size="small"
                                        color={doneToday[task.id!] ? "success" : "primary"}
                                        onClick={() => handleToggleTask(task)}
                                    >
                                        {doneToday[task.id!] ? "Concluída" : "Marcar"}
                                    </Button>
                                }
                            >
                                <ListItemText
                                    primary={
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {task.schedule} - {task.name}
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {task.dailyGoal} {task.measure}/dia
                                        </Typography>
                                    }
                                />
                            </ListItem>
                        </CardContent>
                    </Card>
                ))}
            </List>
        </Container>
    );
}

export default DailyTasks;

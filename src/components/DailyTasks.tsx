import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { archiveTask, getTasks } from "../service/taskService";
import { addTaskLog, deleteTaskLog, getTaskLogByDate } from "../service/taskLogService";
import type { Task } from "../types/Task";
import ArchiveIcon from '@mui/icons-material/Archive';
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';
import {
    Container,
    Typography,
    List,
    ListItem,
    ListItemText,
    Button,
    Card,
    CardContent,
    Modal,
    Box,
} from "@mui/material";
import LoadingScreen from "../views/LoadingScreen";

function DailyTasks() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);
    const [doneToday, setDoneToday] = useState<Record<string, string | null>>({});
    const [openModal, setOpenModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null); // tarefa selecionada

    const fetchTasks = async () => {
        if (!user) return;
        setLoading(true);

        const userTasks = await getTasks(user.uid, false);

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
        setLoading(false);
    };

    useEffect(() => {
        fetchTasks();
    }, [user]);

    const handleToggleTask = async (task: Task) => {
        if (!user || !task.id) return;

        const logId = doneToday[task.id];

        if (logId) {
            await deleteTaskLog(user.uid, logId);
            setDoneToday((prev) => ({ ...prev, [task.id!]: null }));
        } else {
            const value = task.dailyGoal;
            const newLogId = await addTaskLog(
                user.uid,
                {
                    taskId: task.id!,
                    userId: user.uid,
                    doneAt: new Date(),
                    value,
                    measure: task.measure,
                    taskName: task.name,
                },
                task.name,
                task.measure
            );
            setDoneToday((prev) => ({ ...prev, [task.id!]: newLogId }));
        }
    };

    const confirmArchiveTask = async () => {
        if (!user || !selectedTask?.id) return;
        await archiveTask(user.uid, selectedTask.id);
        setOpenModal(false);
        setSelectedTask(null);
        await fetchTasks();
    };

    if (loading) return <LoadingScreen />;

    if (tasks.length === 0) {
        return (
            <Typography
                fontSize={22}
                sx={{ justifyContent: 'center', display: 'flex', p: 1 }}
            >
                Crie uma tarefa para visualizá-la aqui
            </Typography>
        );
    }

    return (
        <>
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
                                        <>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                color={doneToday[task.id!] ? "success" : "primary"}
                                                onClick={() => handleToggleTask(task)}
                                            >
                                                {doneToday[task.id!] ? "Concluída" : "Marcar"}
                                            </Button>
                                            <Button
                                                color="warning"
                                                onClick={() => {
                                                    setSelectedTask(task);
                                                    setOpenModal(true);
                                                }}
                                            >
                                                <ArchiveIcon />
                                            </Button>
                                        </>
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
            <Modal
                open={openModal}
                onClose={() => setOpenModal(false)}
            >
                <Box sx={styleBoxModal}>
                    <div style={{ display: "flex", justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" component="h2">
                            Arquivar Tarefa
                        </Typography>
                        <Button color="inherit" onClick={() => setOpenModal(false)}><CancelPresentationIcon /></Button>
                    </div>
                    <Typography sx={{ mt: 2 }}>
                        Deseja arquivar a tarefa <b>{selectedTask?.name}</b>?
                    </Typography>
                    <Typography sx={{ mt: 2 }}>
                        Você pode exibi-la de novo acessando através do histórico.
                    </Typography>
                    <div style={{ display: "flex", justifyContent: 'space-around', paddingTop: 20 }}>
                        <Button color="info" variant="contained" onClick={confirmArchiveTask}>sim</Button>
                        <Button color="error" variant="contained" onClick={() => setOpenModal(false)}>não</Button>
                    </div>
                </Box>
            </Modal>
        </>
    );
}

const styleBoxModal = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

export default DailyTasks;

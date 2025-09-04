import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

import { useEffect, useState } from "react";
import { deleteTaskPermanently, getTasks, updateTask } from "../service/taskService";
import type { Task } from "../types/Task";
import { useAuth } from "../context/AuthContext";
import { Button, Card, CardContent, Container, List, ListItem, ListItemText, Typography } from "@mui/material";
import LoadingScreen from './LoadingScreen';
import { useNavigate } from 'react-router-dom';

export default function ArchivedTasks() {


    const { user } = useAuth();
    const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate()

    const fetchTasks = async () => {
        if (!user) return;
        setLoading(true);

        const userTasks = await getTasks(user.uid, true);

        setArchivedTasks(userTasks.filter((task) => task.archived));
        setLoading(false);
    };

    useEffect(() => {
        fetchTasks()
    }, [])

    if (loading) return <LoadingScreen />;

    if (archivedTasks.length === 0) {
        return (
            <Typography
                fontSize={22}
                sx={{ justifyContent: 'center', display: 'flex', p: 1 }}
            >
                Você não tem nenhuma tarefa arquivada.
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
                    Tarefas Arquivadas
                </Typography>
                <Button style={{ placeSelf: 'end', display: 'flex' }} color='warning' variant='outlined' onClick={() => navigate('/home')}>Voltar</Button>
                <List>
                    {archivedTasks.map((task) => (
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
                                                color="warning"
                                                onClick={() => {
                                                    if (user?.uid && task.id) {
                                                        updateTask(user?.uid, task.id, { archived: false })
                                                    }
                                                }}
                                            >
                                                <AssignmentReturnOutlinedIcon />
                                            </Button>
                                            <Button
                                                color="error"
                                                onClick={() => {
                                                    if (user?.uid && task.id) {
                                                        deleteTaskPermanently(user.uid, task.id);
                                                    }
                                                }}
                                            >
                                                <DeleteOutlineOutlinedIcon />
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

        </>
    )
}
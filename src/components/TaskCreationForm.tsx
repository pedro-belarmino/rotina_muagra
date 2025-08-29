import { useState } from "react";
import {
    Button,
    Container,
    MenuItem,
    Select,
    Switch,
    TextField,
    Typography,
    FormControlLabel,
    Box,
    Paper,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { addTask } from "../service/taskService";
import type { Task } from "../types/Task";
import SharedSnackbar, { type SeverityType } from "./shared/SharedSnackbar";

export default function TaskCreationForm() {
    const { user } = useAuth();

    const [snackbar, setSnackbar] = useState(false)
    const [snackbarMessage, setSnackbarMessage] = useState('')
    const [severity, setSeverity] = useState<SeverityType>('info')



    const [task, setTask] = useState<Task>({
        name: "",
        description: "",
        measure: "m",
        dailyGoal: 0,
        totalGoal: 0,
        createdAt: null,
        schedule: "",
        dailyTask: true,
    });

    const handleChange = (field: keyof Task, value: any) => {
        setTask((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!user) {
            alert("Você precisa estar logado para criar tarefas.");
            return;
        }

        if (!task.name || !task.measure || !task.dailyGoal || !task.schedule) {
            setSnackbar(true)
            setSnackbarMessage('Preencha todos os campos obrigatórios')
            setSeverity('error')
            return;
        }

        try {
            await addTask(user.uid, task);
            setSnackbar(true)
            setSnackbarMessage('Tafera Criada com Sucesso')
            setSeverity('success')


            // resetar formulário
            setTask({
                name: "",
                description: "",
                measure: "m",
                dailyGoal: 0,
                totalGoal: 0,
                createdAt: null,
                schedule: "",
                dailyTask: true,
            });
        } catch (error) {
            console.error("Erro ao salvar tarefa:", error);
            setSnackbar(true)
            setSnackbarMessage('Tivemos um erro inesperado, contate o suporte')
            setSeverity('error')
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 3 }}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom align="center">
                    Adicione uma Tarefa
                </Typography>

                <Box
                    component="form"
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                    }}
                    noValidate
                    autoComplete="off"
                >
                    <TextField
                        label="Nome"
                        value={task.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        fullWidth
                        required
                    />

                    <TextField
                        label="Descrição"
                        value={task.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                        multiline
                        rows={2}
                        fullWidth
                    />

                    <Select
                        value={task.measure}
                        onChange={(e) => handleChange("measure", e.target.value)}
                        fullWidth
                    >
                        <MenuItem value="m">Metros</MenuItem>
                        <MenuItem value="km">Quilômetros</MenuItem>
                        <MenuItem value="repetition">Repetições</MenuItem>
                        <MenuItem value="time">Tempo</MenuItem>
                    </Select>

                    <TextField
                        label="Meta Diária"
                        type="number"
                        InputProps={{
                            inputProps: { min: 0 },
                            sx: {
                                "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button":
                                {
                                    WebkitAppearance: "none",
                                    margin: 0,
                                },
                                "& input[type=number]": {
                                    MozAppearance: "textfield", // Firefox
                                },
                            },
                        }}
                        value={task.dailyGoal}
                        onChange={(e) => handleChange("dailyGoal", Number(e.target.value))}
                        fullWidth
                        required
                    />

                    <TextField
                        label="Meta Geral"
                        type="number"
                        InputProps={{
                            inputProps: { min: 0 },
                            sx: {
                                "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button":
                                {
                                    WebkitAppearance: "none",
                                    margin: 0,
                                },
                                "& input[type=number]": {
                                    MozAppearance: "textfield", // Firefox
                                },
                            },
                        }}
                        value={task.totalGoal}
                        onChange={(e) => handleChange("totalGoal", Number(e.target.value))}
                        fullWidth
                    />

                    <TextField
                        label="Horário"
                        type="time"
                        value={task.schedule}
                        onChange={(e) => handleChange("schedule", e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        required
                    />

                    <FormControlLabel
                        control={
                            <Switch
                                color="warning"
                                checked={task.dailyTask}
                                onChange={(e) => handleChange("dailyTask", e.target.checked)}
                            />
                        }
                        label="Tarefa diária?"
                    />

                    <Button
                        variant="contained"
                        color="warning"
                        onClick={handleSave}
                        fullWidth
                        sx={{ mt: 2 }}
                    >
                        Salvar
                    </Button>
                </Box>
            </Paper>

            <SharedSnackbar
                open={snackbar}
                message={snackbarMessage}
                severity={severity}
                variant="filled"
                onClose={() => setSnackbar(false)}
            />
        </Container>
    );
}

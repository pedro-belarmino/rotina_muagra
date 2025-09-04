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
import SharedSnackbar from "../shared/SharedSnackbar";
import { useTaskController } from "./TaskCreationForm.controller";

export default function TaskCreationForm() {
    const {
        task,
        snackbar,
        snackbarMessage,
        severity,
        handleChange,
        handleSave,
        setSnackbar,
    } = useTaskController();

    return (
        <Container maxWidth="sm" sx={{ mt: 3 }}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom align="center">
                    Adicione uma Tarefa
                </Typography>

                <Box
                    component="form"
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
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
                        required
                        displayEmpty
                    >
                        <MenuItem value="" disabled>Selecione uma opção:</MenuItem>
                        <MenuItem value="m">Metros</MenuItem>
                        <MenuItem value="km">Quilômetros</MenuItem>
                        <MenuItem value="repetition">Repetições</MenuItem>
                        <MenuItem value="hour">Horas</MenuItem>
                        <MenuItem value="minute">Minutos</MenuItem>
                    </Select>

                    <TextField
                        label="Meta Diária"
                        type="number"
                        value={task.dailyGoal === 0 ? "" : task.dailyGoal} // mostra vazio se for 0
                        onChange={(e) => handleChange("dailyGoal", e.target.value)}
                        fullWidth
                        required
                        InputProps={{
                            inputProps: { min: 0 },
                            sx: {
                                "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button": {
                                    WebkitAppearance: "none",
                                    margin: 0,
                                },
                                "& input[type=number]": { MozAppearance: "textfield" },
                            },
                        }}
                    />

                    <TextField
                        label="Meta Geral"
                        type="number"
                        value={task.totalGoal === 0 ? "" : task.totalGoal}
                        onChange={(e) => handleChange("totalGoal", e.target.value)}
                        fullWidth
                        InputProps={{
                            inputProps: { min: 0 },
                            sx: {
                                "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button": {
                                    WebkitAppearance: "none",
                                    margin: 0,
                                },
                                "& input[type=number]": { MozAppearance: "textfield" },
                            },
                        }}
                    />


                    <TextField
                        label="Horário"
                        type="time"
                        value={task.schedule}
                        onChange={(e) => handleChange("schedule", e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
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

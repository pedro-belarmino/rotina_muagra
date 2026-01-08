
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Checkbox,
    FormControlLabel,
    List,
    ListItem,
    Typography,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import type { Task } from "../../types/Task";

interface ReportConfigurationModalProps {
    open: boolean;
    onClose: () => void;
    tasks: Task[];
    onGenerate: (startDate: Date, endDate: Date, selectedTasks: string[]) => void;
}

export default function ReportConfigurationModal({
    open,
    onClose,
    tasks,
    onGenerate,
}: ReportConfigurationModalProps) {
    const [startDate, setStartDate] = useState<Dayjs | null>(dayjs().startOf("month"));
    const [endDate, setEndDate] = useState<Dayjs | null>(dayjs());
    const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

    useEffect(() => {
        if (tasks) {
            setSelectedTasks(tasks.map(t => t.id).filter((id): id is string => !!id));
        }
    }, [tasks]);

    const handleTaskToggle = (taskId: string) => {
        setSelectedTasks(prev =>
            prev.includes(taskId)
                ? prev.filter(id => id !== taskId)
                : [...prev, taskId]
        );
    };

    const handleGenerate = () => {
        if (startDate && endDate) {
            onGenerate(startDate.toDate(), endDate.toDate(), selectedTasks);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Configurar Relatório</DialogTitle>
            <DialogContent>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                        <DatePicker
                            label="Data de Início"
                            value={startDate}
                            onChange={setStartDate}
                        />
                        <DatePicker
                            label="Data Final"
                            value={endDate}
                            onChange={setEndDate}
                        />
                    </Box>
                </LocalizationProvider>
                <Typography sx={{ mt: 3, mb: 1 }} fontWeight="bold">
                    Selecionar Tarefas
                </Typography>
                <List sx={{ maxHeight: 300, overflow: "auto" }}>
                    {tasks.map(task => (
                        <ListItem key={task.id} dense>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={selectedTasks.includes(task.id!)}
                                        onChange={() => handleTaskToggle(task.id!)}
                                    />
                                }
                                label={task.name}
                            />
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button variant="contained" onClick={handleGenerate}>
                    Gerar
                </Button>
            </DialogActions>
        </Dialog>
    );
}

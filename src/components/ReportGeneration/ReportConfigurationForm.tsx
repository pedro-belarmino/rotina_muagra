
import {
    Box,
    Checkbox,
    FormControlLabel,
    List,
    ListItem,
    Typography,
    Button,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import type { Task } from "../../types/Task";

interface ReportConfigurationFormProps {
    tasks: Task[];
    onGenerate: (startDate: Date, endDate: Date, selectedTasks: string[]) => void;
    onCancel?: () => void;
}

export default function ReportConfigurationForm({
    tasks,
    onGenerate,
    onCancel,
}: ReportConfigurationFormProps) {
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
        <Box>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box sx={{ display: "flex", gap: 2, mt: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
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
            <List sx={{ maxHeight: 300, overflow: "auto", bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
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
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                {onCancel && <Button onClick={onCancel}>Cancelar</Button>}
                <Button variant="contained" color="warning" onClick={handleGenerate}>
                    Gerar Relatório
                </Button>
            </Box>
        </Box>
    );
}

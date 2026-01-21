
import { Container, Typography, Button, Box, Paper } from "@mui/material";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getTasks } from "../service/taskService";
import type { Task } from "../types/Task";
import { useReportGenerationController } from "../components/ReportGeneration/useReportGenerationController";
import ReportConfigurationForm from "../components/ReportGeneration/ReportConfigurationForm";
import ReportDisplayContent from "../components/ReportGeneration/ReportDisplayContent";
import SettingsIcon from '@mui/icons-material/Settings';

export default function Report() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isConfiguring, setIsConfiguring] = useState(true);

    useEffect(() => {
        if (user) {
            getTasks(user.uid, false).then(setTasks);
        }
    }, [user]);

    const {
        generateReport,
        reportData,
    } = useReportGenerationController(tasks);

    const handleGenerate = async (startDate: Date, endDate: Date, selectedTaskIds: string[]) => {
        await generateReport(startDate, endDate, selectedTaskIds);
        setIsConfiguring(false);
    };

    return (
        <Container maxWidth="md" sx={{ py: 4, pb: 10 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">
                    Relatório
                </Typography>
                {reportData && !isConfiguring && (
                    <Button
                        startIcon={<SettingsIcon />}
                        onClick={() => setIsConfiguring(true)}
                        variant="outlined"
                        color="warning"
                    >
                        Configurar
                    </Button>
                )}
            </Box>

            {isConfiguring ? (
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Configurar Período e Tarefas
                    </Typography>
                    <ReportConfigurationForm
                        tasks={tasks}
                        onGenerate={handleGenerate}
                        onCancel={reportData ? () => setIsConfiguring(false) : undefined}
                    />
                </Paper>
            ) : (
                <Box>
                    <ReportDisplayContent data={reportData} />
                </Box>
            )}

            {!reportData && !isConfiguring && (
                <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                    <Typography color="textSecondary">
                        Nenhum dado carregado.
                    </Typography>
                    <Button
                        variant="contained"
                        color="warning"
                        sx={{ mt: 2 }}
                        onClick={() => setIsConfiguring(true)}
                    >
                        Configurar Relatório
                    </Button>
                </Paper>
            )}
        </Container>
    );
}

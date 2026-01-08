
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
    Box,
    Button,

} from "@mui/material";
import { useHistoryDisplayController } from "./HistoryDisplay.controller";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { formatData } from '../../utils/formatting';
import ReportConfigurationModal from "../ReportGeneration/ReportConfigurationModal";
import ReportDisplayModal from "../ReportGeneration/ReportDisplayModal";
import { useReportGenerationController } from "../ReportGeneration/useReportGenerationController";

export default function HistoryDisplay() {

    const {
        taskStats,
        tasks,
        expanded,
        counterAll,
        counterTotal,
        handleChange,
    } = useHistoryDisplayController()

    const {
        configModalOpen,
        displayModalOpen,
        openConfigModal,
        closeConfigModal,
        closeDisplayModal,
        generateReport,
        reportData,
    } = useReportGenerationController(Object.values(tasks).filter(task => !task.archived));

    if (counterTotal == 0 && (Array.isArray(taskStats) ? taskStats.length == 0 : Object.keys(taskStats).length == 0)) return (
        <Container maxWidth="sm" sx={{ py: 3 }}>
            <Container component={Paper} sx={{ margin: 4, placeSelf: "center" }}>
                <Typography
                    fontSize={20}
                    sx={{ justifyContent: "center", display: "flex", p: 1 }}
                >
                    Seu histórico está vazio.
                </Typography>
            </Container>
        </Container>
    )

    return (
        <>
            <ReportConfigurationModal
                open={configModalOpen}
                onClose={closeConfigModal}
                tasks={Object.values(tasks)}
                onGenerate={generateReport}
            />
            <ReportDisplayModal
                open={displayModalOpen}
                onClose={closeDisplayModal}
                data={reportData}
            />
            <Container maxWidth="sm" sx={{ py: 3 }}>
                <Button variant="contained" onClick={openConfigModal} sx={{ mb: 2 }}>
                    Gerar Relatório
                </Button>
                <Typography variant="h5" align="center" gutterBottom fontWeight="bold">
                    Histórico por Tarefa
                </Typography>
                {counterTotal > 0 && (
                    <Card
                        variant="outlined"
                        sx={{
                            mb: 3,
                            borderRadius: 3,
                            p: 3,
                            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                        }}
                    >
                        {/* Total */}
                        <Box sx={{ mb: 2, textAlign: "center" }}>
                            <Typography variant="h4" fontWeight="bold" color="warning">
                                {counterTotal}
                            </Typography>
                            <Typography variant="subtitle2" color="textSecondary">
                                Total de agradecimentos
                            </Typography>
                        </Box>

                        {/* Histórico detalhado */}
                        <Accordion sx={{ borderRadius: 2, mb: 1, boxShadow: "none" }}>
                            <AccordionSummary
                                expandIcon={<KeyboardArrowUpIcon />}
                                sx={{
                                    borderRadius: 2,
                                    px: 2,
                                    py: 1,
                                }}
                            >
                                <Typography variant="body1" fontWeight="medium">
                                    Ver todos os registros
                                </Typography>
                            </AccordionSummary>
                            {counterAll?.sort(
                                (a, b) => new Date(b.dateKey).getTime() - new Date(a.dateKey).getTime()
                            ).map((item, index) => (
                                <AccordionDetails key={index} sx={{ borderRadius: 2, px: 2 }}>
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                        <Typography variant="body2" color="textSecondary">
                                            <strong>Data:</strong> {formatData(item.dateKey)}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            <strong>Valor:</strong> {item.value}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            <strong>Comentário:</strong> {item.comment}
                                        </Typography>
                                    </Box>
                                    <Divider sx={{ mt: 2 }} />
                                </AccordionDetails>
                            ))}
                        </Accordion>
                    </Card>
                )}

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
                                                    <>
                                                        <ListItem key={log.id}>
                                                            <ListItemText
                                                                primary={new Date(log.doneAt).toLocaleString()}
                                                                secondary={task.measure != '' && `${log.value} ${task?.measure}`}
                                                            />
                                                        </ListItem>
                                                        <Divider />
                                                    </>
                                                ))}
                                        </List>
                                    </AccordionDetails>
                                </Accordion>
                            </CardContent>
                        </Card>
                    );
                })}
            </Container>


        </>
    );
}

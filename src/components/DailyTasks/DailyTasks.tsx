import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import UnarchiveOutlinedIcon from '@mui/icons-material/UnarchiveOutlined';
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
    Paper,
    TextField,
    Pagination,
    Stack
} from "@mui/material";
import LoadingScreen from "../../views/LoadingScreen";
import { useDailyTasksController } from './DailyTasks.controller';
import { useNavigate } from 'react-router-dom';
import { formatMeasure } from '../../utils/formatting';
import { useState } from 'react';

function DailyTasks() {
    const {
        timeLeft,
        confirmArchiveTask,
        confirmModalOpen,
        setConfirmModalOpen,
        goalValue,
        setGoalValue,
        openConfirmModal,
        confirmToggleTask,
        goalType,
        setOpenModal,
        setSelectedTask,
        selectedTask,
        doneToday,
        tasks,
        loading,
        openModal,
    } = useDailyTasksController()
    const navigate = useNavigate()

    // Estado da paginação
    const [page, setPage] = useState(1);
    const itemsPerPage = 5;

    // Cálculo da paginação
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTasks = tasks.slice(startIndex, endIndex);
    const totalPages = Math.ceil(tasks.length / itemsPerPage);

    if (loading) return <LoadingScreen />;

    if (tasks.length === 0) {
        return (
            <Container>
                <Container component={Paper} >
                    <Typography
                        fontSize={22}
                        sx={{ justifyContent: 'center', display: 'flex', p: 1 }}
                    >
                        Crie uma tarefa para visualizá-la aqui
                    </Typography>
                </Container>
                <Button sx={{ display: 'flex' }} color='inherit' onClick={() => navigate('/arquivadas')}>
                    <UnarchiveOutlinedIcon />
                    tarefas arquivadas
                </Button>
            </Container>
        );
    }

    return (
        <>
            <Container maxWidth="sm" sx={{ py: 3 }}>
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 2, textAlign: { xs: "center", sm: "left" } }}
                >
                    <Box sx={{ width: { xs: "100%", sm: "auto" } }}>
                        <Typography variant="h5" fontWeight="bold" noWrap>
                            Minhas Tarefas do Dia
                        </Typography>
                    </Box>

                    <Box sx={{ width: { xs: "100%", sm: "auto" } }}>
                        <Typography variant="body2" color="text.secondary" sx={{ textDecoration: "underline" }}>
                            {timeLeft}
                        </Typography>
                    </Box>
                </Stack>

                <List>
                    {paginatedTasks.map((task) => (
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
                                                onClick={() => openConfirmModal(task)}
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
                                                <ArchiveOutlinedIcon />
                                            </Button>
                                        </>
                                    }
                                >
                                    {task.measure ? (
                                        <ListItemText
                                            primary={
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    {task.schedule == '' ? (
                                                        <>
                                                            {task.name}
                                                        </>
                                                    ) :
                                                        <>
                                                            {task.schedule} - {task.name}
                                                        </>
                                                    }
                                                </Typography>
                                            }
                                            secondary={
                                                <Typography variant="body2" color="text.secondary">
                                                    {task.dailyGoal} {formatMeasure(task.measure)}/dia
                                                </Typography>
                                            }
                                        />
                                    ) : (
                                        <ListItemText
                                            primary={
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    {task.schedule} - {task.name}
                                                </Typography>
                                            }
                                        />
                                    )}
                                </ListItem>
                            </CardContent>
                        </Card>
                    ))}
                </List>

                {/* Paginação */}
                <Box display="flex" justifyContent="center" mt={2}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, value) => setPage(value)}
                        color="standard"
                        shape="rounded"
                    />
                </Box>

                <Button color='inherit' onClick={() => navigate('/arquivadas')}>
                    <UnarchiveOutlinedIcon />
                    tarefas arquivadas
                </Button>
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
                        Você pode reexibi-la acessando-a através da página de tarefas arquivadas.
                    </Typography>
                    <div style={{ display: "flex", justifyContent: 'space-around', paddingTop: 20 }}>
                        <Button color="info" variant="contained" onClick={confirmArchiveTask}>sim</Button>
                        <Button color="error" variant="contained" onClick={() => setOpenModal(false)}>não</Button>
                    </div>
                </Box>
            </Modal>
            <Modal
                open={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
            >
                <Box sx={styleBoxModal}>
                    <div style={{ display: "flex", justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" component="h2">
                            Confirmar Tarefa
                        </Typography>
                        <Button color="inherit" onClick={() => setConfirmModalOpen(false)}>
                            <CancelPresentationIcon />
                        </Button>
                    </div>
                    <Typography sx={{ mt: 2 }}>
                        {doneToday[selectedTask?.id ?? ""]
                            ? `Deseja desmarcar a tarefa "${selectedTask?.name}"?`
                            : `Deseja marcar a tarefa "${selectedTask?.name}" como concluída?`}
                    </Typography>

                    {!doneToday[selectedTask?.id ?? ""] && (
                        <Box sx={{ mt: 2, display: `flex` }}>
                            <TextField
                                variant='standard'
                                type="number"
                                label='Meta'
                                value={goalValue}
                                onChange={(e) => setGoalValue(e.target.value)}
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
                            <p>{formatMeasure(goalType)}</p>
                        </Box>

                    )}

                    <div style={{ display: "flex", justifyContent: 'space-around', paddingTop: 20 }}>
                        <Button color="info" variant="contained" onClick={confirmToggleTask}>Confirmar</Button>
                        <Button color="error" variant="contained" onClick={() => setConfirmModalOpen(false)}>Cancelar</Button>
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

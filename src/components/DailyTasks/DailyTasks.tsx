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
import LoadingScreen from "../../views/LoadingScreen";
import { useDailyTasksController } from './DailyTasks.controller';

function DailyTasks() {

    const {
        confirmArchiveTask,
        handleToggleTask,
        setOpenModal,
        setSelectedTask,
        selectedTask,
        doneToday,
        tasks,
        loading,
        openModal,
    } = useDailyTasksController()


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

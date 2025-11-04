import {
    Container,
    Button,
    Paper,
    Typography,
    List,
    Card,
    CardContent,
    ListItem,
    ListItemText,
    Modal,
    Box,
    Pagination,
} from "@mui/material";
import LoadingScreen from "../../views/LoadingScreen";
import { useArchivedTasksListController } from "./ArchivedTasksList.controller";
import CancelPresentationRoundedIcon from "@mui/icons-material/CancelPresentationRounded";
// import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AssignmentReturnOutlinedIcon from "@mui/icons-material/AssignmentReturnOutlined";
import { formatMeasure } from "../../utils/formatting";
import { useState } from "react";

export default function ArchivedTasksList() {
    const {
        confirmDeleteTask,
        confirmUnarchiveTask,
        navigate,
        setSelectedTask,
        setUnarchiveModal,
        handleCloseModal,
        // setDeleteModal,
        selectedTask,
        deleteModal,
        unarchiveModal,
        archivedTasks,
        loading,
    } = useArchivedTasksListController();

    const [page, setPage] = useState(1);
    const itemsPerPage = 6;

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTasks = archivedTasks.slice(startIndex, endIndex);
    const totalPages = Math.ceil(archivedTasks.length / itemsPerPage);

    if (loading) return <LoadingScreen />;

    if (archivedTasks.length === 0) {
        return (
            <Container maxWidth="sm" sx={{ py: 3 }}>
                <Button
                    style={{ placeSelf: "end", display: "flex" }}
                    color="warning"
                    variant="outlined"
                    onClick={() => navigate("/home")}
                >
                    Voltar
                </Button>
                <Container component={Paper} sx={{ margin: 4, placeSelf: "center" }}>
                    <Typography
                        fontSize={20}
                        sx={{ justifyContent: "center", display: "flex", p: 1 }}
                    >
                        Você não tem nenhuma tarefa arquivada.
                    </Typography>
                </Container>
            </Container>
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
                <Button
                    style={{ placeSelf: "end", display: "flex" }}
                    color="warning"
                    variant="outlined"
                    onClick={() => navigate("/home")}
                >
                    Voltar
                </Button>

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
                                                color="warning"
                                                onClick={() => {
                                                    setSelectedTask(task);
                                                    setUnarchiveModal(true);
                                                }}
                                            >
                                                <AssignmentReturnOutlinedIcon />
                                            </Button>
                                            {/* <Button
                                                color="error"
                                                onClick={() => {
                                                    setSelectedTask(task);
                                                    setDeleteModal(true);
                                                }}
                                            >
                                                <DeleteOutlineRoundedIcon />
                                            </Button> */}
                                        </>
                                    }
                                >
                                    {task.measure ? (
                                        <ListItemText
                                            primary={
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    {task.schedule} - {task.name}
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
                <Box
                    display="flex"
                    justifyContent={{ xs: "center", sm: "center" }}
                    mt={2}
                >
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, value) => setPage(value)}
                        color="primary"
                        shape="rounded"
                    />
                </Box>
            </Container>

            {/* Modal desarquivar */}
            <Modal open={unarchiveModal} onClose={handleCloseModal}>
                <Box sx={styleBoxModal}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Typography variant="h6" component="h2">
                            Desarquivar Tarefa
                        </Typography>
                        <Button color="inherit" onClick={handleCloseModal}>
                            <CancelPresentationRoundedIcon />
                        </Button>
                    </div>
                    <Typography sx={{ mt: 2 }}>
                        Deseja desarquivar a tarefa <b>{selectedTask?.name}</b>?
                    </Typography>
                    <Typography sx={{ mt: 2 }}>
                        Você pode arquivá-la novamente quando quiser.
                    </Typography>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-around",
                            paddingTop: 20,
                        }}
                    >
                        <Button color="info" variant="contained" onClick={confirmUnarchiveTask}>
                            sim
                        </Button>
                        <Button color="error" variant="contained" onClick={handleCloseModal}>
                            não
                        </Button>
                    </div>
                </Box>
            </Modal>

            {/* Modal deletar */}
            <Modal open={deleteModal} onClose={handleCloseModal}>
                <Box sx={styleBoxModal}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Typography variant="h6" component="h2">
                            Deletar Tarefa
                        </Typography>
                        <Button color="inherit" onClick={handleCloseModal}>
                            <CancelPresentationRoundedIcon />
                        </Button>
                    </div>
                    <Typography sx={{ mt: 2 }}>
                        Deseja deletar permanentemente a tarefa <b>{selectedTask?.name}</b>?
                    </Typography>
                    <Typography sx={{ mt: 2 }}>
                        Você não terá mais acesso a essa tarefa nem ao histórico dela.
                    </Typography>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-around",
                            paddingTop: 20,
                        }}
                    >
                        <Button color="info" variant="contained" onClick={confirmDeleteTask}>
                            sim
                        </Button>
                        <Button color="error" variant="contained" onClick={handleCloseModal}>
                            não
                        </Button>
                    </div>
                </Box>
            </Modal>
        </>
    );
}

const styleBoxModal = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
};

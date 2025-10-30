import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import UnarchiveOutlinedIcon from '@mui/icons-material/UnarchiveOutlined';
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
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
    Stack,
    Checkbox,
    IconButton
} from "@mui/material";
import MenuBookIcon from '@mui/icons-material/MenuBook';

import Tooltip from '@mui/material/Tooltip';
import LoadingScreen from "../../views/LoadingScreen";
import { useDailyTasksController } from './DailyTasks.controller';
import { useNavigate } from 'react-router-dom';
import { formatMeasure } from '../../utils/formatting';
import { useState } from 'react';
import SharedSnackbar from '../shared/SharedSnackbar';
import { daysInMonthFor, daysInYearFor } from '../../utils/period';
import { useTheme } from '@mui/material/styles';
function DailyTasks() {
    const {
        handleTogglePriority,
        addCounter,
        saveComment,
        setConfirmModalOpen,
        setGoalValue,
        openConfirmModal,
        confirmToggleTask,
        confirmArchiveTask,
        setOpenModal,
        setSelectedTask,
        setSnackbar,
        setDiaryModal,
        setComment,
        commentLenght,
        diarModal,
        snackbarMessage,
        severity,
        snackbar,
        confirmModalOpen,
        timeLeft,
        goalValue,
        goalType,
        counter,
        comment,
        selectedTask,
        doneToday,
        tasks,
        loading,
        openModal,
    } = useDailyTasksController()
    const navigate = useNavigate()

    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';


    const [page, setPage] = useState(1);
    const itemsPerPage = 8;


    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTasks = tasks.slice(startIndex, endIndex);
    const totalPages = Math.ceil(tasks.length / itemsPerPage);

    if (loading) return <LoadingScreen />;


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
                            Minhas Rotinas Diárias
                        </Typography>
                    </Box>

                    <Box sx={{ width: { xs: "100%", sm: "auto" } }}>
                        <Typography variant="body2" color="text.secondary" sx={{ textDecoration: "underline" }}>
                            {timeLeft}
                        </Typography>
                    </Box>
                </Stack>

                {/* Contador de Muagra */}
                <Card
                    sx={{
                        mb: 2,
                        borderRadius: 3,
                        boxShadow: 1,
                        textAlign: "center",
                        p: 1.5,
                    }}
                >
                    <CardContent sx={{ py: 1, "&:last-child": { pb: 1 } }}>
                        {isDarkMode ? (
                            <img
                                src="/Logo Muagrômetro Final Colorida para fundo escuro .png"
                                style={{ width: 200 }}
                                alt="Logo para fundo escuro"
                            />
                        ) : (
                            <img
                                src="/Logo Muagrômetro Final Colorido.png"
                                style={{ width: 200 }}
                                alt="Logo para fundo claro"
                            />
                        )}
                        <Typography
                            variant="h5"
                            fontWeight="bold"
                            color="warning.main"
                            sx={{ my: 0.5 }}
                        >
                            {counter}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ position: 'relative' }} justifyContent="center">
                            <Button
                                size="small"
                                variant="outlined"
                                color="warning"
                                onClick={addCounter}
                                sx={{ textTransform: "none", fontWeight: "bold" }}
                            >
                                + Lembrei de Agradecer
                            </Button>
                            <Tooltip title={'Muagrometro global'}>

                                <Box
                                    onClick={() => navigate("/muagrometro")}
                                    component="img"
                                    src="/Globo.png"
                                    alt=""
                                    sx={{
                                        cursor: "pointer",
                                        position: "absolute",
                                        right: 0,
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        height: "150%",
                                        objectFit: "contain",
                                    }}
                                />
                            </Tooltip>
                            <Tooltip title='Seu diario de agradecimento' onClick={() => setDiaryModal(true)}>
                                <IconButton
                                    size='large'
                                    sx={{
                                        cursor: "pointer",
                                        position: "absolute",
                                        left: 0,
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                    }}
                                >
                                    <MenuBookIcon />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </CardContent>
                </Card>


                {/* <Card
                    sx={{
                        mb: 2,
                        borderRadius: 3,
                        boxShadow: 1,
                        textAlign: "center",
                        p: 1.5,
                    }}
                >
                    <CardContent sx={{ py: 1, "&:last-child": { pb: 1 } }}>
                        <TextField
                            fullWidth
                            label="A quem ou a o que lembrou de agradecer?"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            margin="normal"
                            variant="outlined"
                            inputProps={{ maxLength: 200 }}
                        />
                        <Stack direction="row" spacing={1} justifyContent="center">
                            <Button
                                size="small"
                                variant="outlined"
                                color="warning"
                                onClick={saveComment}
                                sx={{ textTransform: "none", fontWeight: "bold" }}
                            >
                                Salvar Comentário
                            </Button>
                        </Stack>
                    </CardContent>
                </Card> */}

                {tasks.length === 0 ? <>

                    <Container component={Paper} sx={{ margin: 4, placeSelf: "center" }}>
                        <Typography
                            fontSize={16}
                            fontWeight={"bold"}
                            sx={{ justifyContent: "center", display: "flex", p: 1 }}
                        >
                            Crie uma tafera para visualizá-la aqui.
                        </Typography>
                    </Container>
                </> : <>


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
                                    <ListItem disableGutters>
                                        <Stack
                                            direction={{ xs: "column", sm: "row" }}
                                            spacing={1}
                                            alignItems={{ xs: "flex-start", sm: "center" }}
                                            justifyContent="space-between"
                                            sx={{ width: "100%" }}
                                        >
                                            <Stack direction="row" alignItems="center">
                                                <Checkbox
                                                    icon={<StarBorderIcon />}
                                                    checkedIcon={<StarIcon color='warning' />}
                                                    checked={!!task.priority}
                                                    onChange={() => handleTogglePriority(task)}
                                                    sx={{ alignSelf: 'self-start' }}
                                                />
                                                <ListItemText
                                                    primary={
                                                        <Typography variant="subtitle1" fontWeight="bold" noWrap={false}>
                                                            {task.schedule === ""
                                                                ? task.name
                                                                : `${task.schedule} - ${task.name}`}
                                                        </Typography>
                                                    }
                                                    secondary={
                                                        <Typography variant="body2" color="text.secondary">
                                                            {task.dailyGoal > 0 && (
                                                                <>
                                                                    {task.dailyGoal} {formatMeasure(task.measure || '')} / dia
                                                                </>
                                                            )}
                                                            {task.dailyGoal != 0 ? (
                                                                <>
                                                                    <br />
                                                                    Total no mês: {(task.totalMonth ?? 0)} {formatMeasure(task.measure || '')} ({(task.days ?? 0)} / {daysInMonthFor(new Date())} dias)
                                                                    <br />
                                                                    Total no ano: {(task.totalYear ?? 0)} {formatMeasure(task.measure || '')} ({(task.daysYear ?? 0)} / {daysInYearFor(new Date())} dias)

                                                                </>
                                                            ) : (
                                                                <>
                                                                    <br />
                                                                    Feitos no mês: {(task.days ?? 0)} / {daysInMonthFor(new Date())}
                                                                    <br />
                                                                    Feitos no ano: {(task.daysYear ?? 0)} / {daysInYearFor(new Date())}
                                                                </>
                                                            )}

                                                        </Typography>
                                                    }
                                                />
                                            </Stack>

                                            {/* Botões */}
                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                justifyContent={{ xs: "flex-end", sm: "flex-start" }}
                                                sx={{ width: { xs: "100%", sm: "auto" } }}
                                            >
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
                                            </Stack>
                                        </Stack>
                                    </ListItem>

                                </CardContent>
                            </Card>
                        ))}
                    </List>
                </>
                }

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

                    {!doneToday[selectedTask?.id ?? ""] && (selectedTask?.dailyGoal ?? 0) > 0 ? (
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

                    ) :
                        <></>
                    }

                    <div style={{ display: "flex", justifyContent: 'space-around', paddingTop: 20 }}>
                        <Button color="info" variant="contained" onClick={confirmToggleTask}>Confirmar</Button>
                        <Button color="error" variant="contained" onClick={() => setConfirmModalOpen(false)}>Cancelar</Button>
                    </div>
                </Box>
            </Modal>
            <SharedSnackbar
                open={snackbar}
                message={snackbarMessage}
                severity={severity}
                variant="filled"
                onClose={() => setSnackbar(false)}
            />

            <Modal
                open={diarModal}
                onClose={() => setDiaryModal(false)}
                aria-labelledby="diary-modal-title"
                aria-describedby="diary-modal-description"
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: "100vh",
                        p: 2,
                    }}
                >
                    <Paper
                        sx={{
                            width: "100%",
                            maxWidth: { xs: 350, sm: 500, md: 600 },
                            p: 3,
                            borderRadius: 3,
                            boxShadow: 6,
                        }}
                    >
                        <Container
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                mb: 2,
                            }}
                        >
                            <Typography
                                id="diary-modal-title"
                                variant="h6"
                                fontWeight="bold"
                                sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                            >
                                A quem ou a que lembrou de agradecer?
                            </Typography>

                            <Button
                                color="warning"
                                onClick={() => setDiaryModal(false)}
                                sx={{ minWidth: 0 }}
                            >
                                <CancelPresentationIcon />
                            </Button>
                        </Container>

                        <Typography
                            variant="body2"
                            textAlign="right"
                            color={commentLenght >= 200 ? "error" : "text.secondary"}
                        >
                            {commentLenght} / 200
                        </Typography>

                        <TextField
                            fullWidth
                            multiline
                            minRows={3}
                            maxRows={6}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            margin="normal"
                            variant="outlined"
                            inputProps={{ maxLength: 200 }}
                        />

                        <Container sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                            <Button
                                size="small"
                                variant="outlined"
                                color="warning"
                                onClick={() => { saveComment(); setDiaryModal(false) }}
                                sx={{ textTransform: "none", fontWeight: "bold" }}
                            >
                                Salvar Comentário
                            </Button>
                        </Container>
                    </Paper>
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

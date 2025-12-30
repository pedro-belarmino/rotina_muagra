import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import UnarchiveOutlinedIcon from '@mui/icons-material/UnarchiveOutlined';
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import {
    Container,
    Typography,
    List,
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
    CircularProgress,
} from "@mui/material";

import Tooltip from '@mui/material/Tooltip';
import LoadingScreen from "../../views/LoadingScreen";
import { useDailyTasksController } from './DailyTasks.controller';
import { useNavigate } from 'react-router-dom';
import { formatMeasure } from '../../utils/formatting';
import { useState } from 'react';
import SharedSnackbar from '../shared/SharedSnackbar';
import BigIconRenderer from '../shared/BigIconRender';
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
        monthlyProgress,
        yearlyProgress,
        monthlyDays,
        yearlyDays,
        totalDaysInMonth,
        totalDaysInYear,
        comment,
        selectedTask,
        doneToday,
        tasks,
        loading,
        openModal,
        monthlyTotals,
        yearlyTotals,
        monthlyLogDays,
        yearlyLogDays,
    } = useDailyTasksController()
    const navigate = useNavigate()

    const theme = useTheme();
    const isDarkMode = theme.palette.mode === 'dark';


    const [page, setPage] = useState(1);

    const itemsPerPage = 8;

    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    const fullDateDisplay = `${day}/${month}/${year}`;

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
                        <Typography variant="h6" fontWeight="bold" noWrap>
                            Minhas Rotinas de Hoje - {fullDateDisplay}
                        </Typography>
                    </Box>

                    <Box sx={{ width: { xs: "100%", sm: "auto" } }}>
                        <Typography variant="body2" color="text.secondary" sx={{ textDecoration: "underline" }}>
                            Ainda da tempo: {timeLeft}
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
                            <Tooltip title={'Muagrômetro Global'}>

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
                                {isDarkMode ? (
                                    <Box
                                        onClick={() => setDiaryModal(true)}
                                        component="img"
                                        src="/diario/Ícone Diário para fundo claro.png"
                                        alt=""
                                        sx={{
                                            cursor: "pointer",
                                            position: "absolute",
                                            left: 0,
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            height: "150%",
                                            objectFit: "contain",
                                        }}
                                    />
                                ) : (
                                    <Box
                                        onClick={() => setDiaryModal(true)}
                                        component="img"
                                        src="/diario/ìcone Diário para fundo Escuro.png"
                                        alt=""
                                        sx={{
                                            cursor: "pointer",
                                            position: "absolute",
                                            left: 0,
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            height: "150%",
                                            objectFit: "contain",
                                        }}
                                    />
                                )}
                            </Tooltip>
                        </Stack>
                    </CardContent>
                </Card>

                <Card sx={{ mb: 2, borderRadius: 3, boxShadow: 1, p: 1.5 }}>
                    <CardContent sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', py: 1, '&:last-child': { pb: 1 } }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                Progresso no Mês
                            </Typography>
                            <Box sx={{ position: 'relative', display: 'inline-flex', mt: 1 }}>
                                <CircularProgress variant="determinate" value={monthlyProgress} color='warning' />
                                <Box
                                    sx={{
                                        top: 0,
                                        left: 0,
                                        bottom: 0,
                                        right: 0,
                                        position: 'absolute',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Typography variant="caption" component="div" color="text.secondary">
                                        {`${Math.round(monthlyProgress)}%`}
                                    </Typography>
                                </Box>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {monthlyDays} / {totalDaysInMonth} dias
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                Progresso no Ano
                            </Typography>
                            <Box sx={{ position: 'relative', display: 'inline-flex', mt: 1 }}>
                                <CircularProgress variant="determinate" value={yearlyProgress} color='warning' />
                                <Box
                                    sx={{
                                        top: 0,
                                        left: 0,
                                        bottom: 0,
                                        right: 0,
                                        position: 'absolute',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Typography variant="caption" component="div" color="text.secondary">
                                        {`${Math.round(yearlyProgress)}%`}
                                    </Typography>
                                </Box>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {yearlyDays} / {totalDaysInYear} dias
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>



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


                        {paginatedTasks.map((task) => {
                            const monthDays = daysInMonthFor(new Date());

                            const currentDate = new Date();
                            const currentDayOfMonth = currentDate.getDate();
                            const yearDays = daysInYearFor(currentDate);
                            const dailyGoal = Number(task.dailyGoal ?? 0);

                            let monthPercent, yearPercent, monthLabel, yearLabel, monthPercentToPendant, monthPendingLabelToPendant;

                            if (dailyGoal > 0) {
                                const monthGoalTotal = monthDays * dailyGoal;

                                const monthGoalToDate = currentDayOfMonth * dailyGoal;
                                const yearGoalTotal = yearDays * dailyGoal;
                                const monthTotal = monthlyTotals[task.id!] ?? 0;
                                const yearTotal = yearlyTotals[task.id!] ?? 0;

                                monthPercent = (monthTotal / monthGoalTotal) * 100;
                                monthPercentToPendant = (monthTotal / monthGoalToDate) * 100;

                                yearPercent = (yearTotal / yearGoalTotal) * 100;

                                monthLabel = `${monthTotal} ${formatMeasure(task.measure || '')} / ${monthGoalTotal} ${formatMeasure(task.measure || '')}`;

                                yearLabel = `${yearTotal} ${formatMeasure(task.measure || '')} / ${yearGoalTotal} ${formatMeasure(task.measure || '')}`;

                                const monthPendingToPendant = monthGoalToDate - monthTotal;
                                monthPendingLabelToPendant = `${monthPendingToPendant > 0 ? monthPendingToPendant : 0} ${formatMeasure(task.measure || '')} / ${monthGoalToDate} ${formatMeasure(task.measure || '')}`;




                            } else {
                                const completedMonthDays = monthlyLogDays[task.id!] ?? 0;
                                const completedYearDays = yearlyLogDays[task.id!] ?? 0;

                                monthPercent = (completedMonthDays / monthDays) * 100;
                                monthPercentToPendant = (completedMonthDays / currentDayOfMonth) * 100;
                                yearPercent = (completedYearDays / yearDays) * 100;

                                monthLabel = `${completedMonthDays} / ${monthDays} dias`
                                yearLabel = `${completedYearDays} / ${yearDays} dias`;



                                const monthPendingToPendant = currentDayOfMonth - completedMonthDays;
                                monthPendingLabelToPendant = `${monthPendingToPendant > 0 ? monthPendingToPendant : 0} / ${currentDayOfMonth} dias`;


                            }

                            return (
                                <>
                                    <Card
                                        key={task.id}
                                        sx={{
                                            mb: 2,
                                            borderRadius: 3,
                                            boxShadow: 2,
                                            p: 2,
                                        }}
                                    >
                                        <div style={{ display: 'flex', width: '100%' }}>

                                            {/* LEFT – 2/3 */}
                                            <Box sx={{ flex: 2 }}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                                    <Box sx={{ width: '100%' }}>
                                                        <Typography variant="h6" fontWeight="bold">
                                                            {task.name}
                                                        </Typography>

                                                        {task.dailyGoal > 0 && (
                                                            <Typography variant="body2" color="text.secondary">
                                                                {task.dailyGoal} {formatMeasure(task.measure || ``)} / dia
                                                            </Typography>
                                                        )}

                                                        {/* PROGRESS SECTION */}
                                                        <Box mt={0}>

                                                            {/* Month */}
                                                            <Typography fontSize={13} color="warning.main">
                                                                Progresso no Mês
                                                            </Typography>

                                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                                <Box flexGrow={1}>
                                                                    <Box
                                                                        sx={{
                                                                            width: "100%",
                                                                            height: 4,
                                                                            bgcolor: "grey.800",
                                                                            borderRadius: 5,
                                                                            overflow: "hidden",
                                                                        }}
                                                                    >
                                                                        <Box
                                                                            sx={{
                                                                                width: `${monthPercent}%`,
                                                                                height: "4px",
                                                                                bgcolor: "warning.main",
                                                                            }}
                                                                        />
                                                                    </Box>
                                                                </Box>

                                                                <Typography fontSize={12}>
                                                                    {Math.round(monthPercent)}%
                                                                </Typography>
                                                            </Box>

                                                            <Typography fontSize={12} color="text.secondary">
                                                                {monthLabel}
                                                            </Typography>

                                                            {/* Year */}
                                                            <Typography fontSize={13} color="warning.main" mt={0}>
                                                                Progresso no Ano
                                                            </Typography>

                                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                                <Box flexGrow={1}>
                                                                    <Box
                                                                        sx={{
                                                                            width: "100%",
                                                                            height: 4,
                                                                            bgcolor: "grey.800",
                                                                            borderRadius: 5,
                                                                            overflow: "hidden",
                                                                        }}
                                                                    >
                                                                        <Box
                                                                            sx={{
                                                                                width: `${yearPercent}%`,
                                                                                height: "4px",
                                                                                bgcolor: "warning.main",
                                                                            }}
                                                                        />
                                                                    </Box>
                                                                </Box>

                                                                <Typography fontSize={12}>
                                                                    {Math.round(yearPercent)}%
                                                                </Typography>
                                                            </Box>

                                                            <Typography fontSize={12} color="text.secondary">
                                                                {yearLabel}
                                                            </Typography>
                                                            {/* PENDENTE */}
                                                            <Typography fontSize={monthPercentToPendant < 100 ? 13 : 15} color={monthPercentToPendant < 100 ? 'error.main' : 'success.main'} mt={0}>
                                                                {monthPercentToPendant < 100 ? <>Pendente até Hoje</> : <>Você está em dia com esta Tarefa! Muagra!</>}
                                                            </Typography>

                                                            {monthPercentToPendant < 100 ? <>
                                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                                    <Box flexGrow={1}>

                                                                        <Box
                                                                            sx={{
                                                                                width: "100%",
                                                                                height: 4,
                                                                                bgcolor: "success.main",
                                                                                borderRadius: 5,
                                                                                overflow: "hidden",
                                                                                direction: 'rtl'

                                                                            }}
                                                                        >
                                                                            <Box
                                                                                sx={{
                                                                                    width: `${100 - monthPercentToPendant}%`,
                                                                                    height: "4px",
                                                                                    bgcolor: "error.main",
                                                                                }}
                                                                            />
                                                                        </Box>

                                                                    </Box>

                                                                    <Typography fontSize={12}>
                                                                        {Math.round(100 - monthPercentToPendant)}%
                                                                    </Typography>
                                                                </Box>

                                                                <Typography fontSize={12} color="text.secondary">
                                                                    {monthPendingLabelToPendant}
                                                                </Typography>
                                                            </> :

                                                                <>

                                                                </>
                                                            }


                                                        </Box>
                                                    </Box>
                                                </Stack>
                                            </Box>

                                            {/* RIGHT – 1/3 (centered) */}
                                            <Box
                                                sx={{
                                                    flex: 1,
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                }}
                                            >
                                                {task.taskType === 'personal' && task.icon && (
                                                    <BigIconRenderer iconName={task.icon} />
                                                )}

                                                {task.taskType === 'gratitude' && task.gratitudeTrack && (
                                                    <img
                                                        src={`/icons/${task.gratitudeTrack}.png`}
                                                        alt={task.gratitudeTrack}
                                                        style={{ width: 80, height: 80 }}
                                                    />
                                                )}
                                            </Box>
                                        </div>




                                        {/* BOTTOM BUTTONS */}
                                        <Stack
                                            direction="row"
                                            alignItems="center"
                                        >
                                            <Button
                                                variant="contained"
                                                color={doneToday[task.id!] ? "success" : "primary"}
                                                onClick={() => openConfirmModal(task)}
                                                sx={{ textTransform: "none", px: 3 }}
                                            >
                                                {doneToday[task.id!] ? "Concluído" : "Concluir"}
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

                                            <Checkbox
                                                icon={<StarBorderIcon />}
                                                checkedIcon={<StarIcon color="warning" />}
                                                checked={!!task.priority}
                                                onChange={() => handleTogglePriority(task)}
                                            />
                                        </Stack>

                                    </Card>
                                </>

                            );
                        })}

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
                                onChange={(e) => setGoalValue(e.target.value.slice(0, 5))}
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

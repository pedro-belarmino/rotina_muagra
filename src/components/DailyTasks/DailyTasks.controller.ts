import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getTaskLogByDate, deleteTaskLog, addTaskLog } from "../../service/taskLogService";
import { getTasks, archiveTask, ensureTaskPeriodIsCurrent, ensureTaskYearIsCurrent, updateTask } from "../../service/taskService";
import type { Task } from "../../types/Task";
import { getDailyCounter, incrementDailyCounter } from "../../service/counterService";
import type { SeverityType } from "../shared/SharedSnackbar";


export const useDailyTasksController = () => {

    const { user } = useAuth();
    const [timeLeft, setTimeLeft] = useState("");
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);
    const [doneToday, setDoneToday] = useState<Record<string, string | null>>({});
    const [openModal, setOpenModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null); // tarefa selecionada

    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [goalValue, setGoalValue] = useState<number | string>("");
    const [goalType, setGoalType] = useState<string>("");
    const [counter, setCounter] = useState<number>(0)

    const [snackbar, setSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [severity, setSeverity] = useState<SeverityType>('info');

    const openConfirmModal = (task: Task) => {
        setSelectedTask(task);
        setGoalValue(task.dailyGoal); // valor inicial
        setGoalType(task.measure || '')
        setConfirmModalOpen(true);
    };

    const confirmToggleTask = async () => {
        if (!user || !selectedTask?.id) return;

        const logId = doneToday[selectedTask.id];
        if (logId) {
            await deleteTaskLog(user.uid, logId);
            setDoneToday((prev) => ({ ...prev, [selectedTask.id!]: null }));

            await updateTask(user.uid, selectedTask.id, {
                days: (selectedTask.days ?? 0) - 1,
                daysYear: (selectedTask.daysYear ?? 0) - 1,
            });
        } else {
            const value = selectedTask.dailyGoal;
            const newLogId = await addTaskLog(
                user.uid,
                { taskId: selectedTask.id!, userId: user.uid, doneAt: new Date(), value, measure: selectedTask.measure || '', taskName: selectedTask.name },
                selectedTask.name,
                selectedTask.measure || ''
            );
            setDoneToday((prev) => ({ ...prev, [selectedTask.id!]: newLogId }));

            await updateTask(user.uid, selectedTask.id, {
                days: (selectedTask.days ?? 0) + 1,
                daysYear: (selectedTask.daysYear ?? 0) + 1,
            });
        }
        setConfirmModalOpen(false);
        setSelectedTask(null);
        fetchTasks()
    };


    const fetchTasks = async () => {
        if (!user) return;
        setLoading(true);

        let userTasks = await getTasks(user.uid, false);

        // garante período atual (reseta days se necessário)
        for (const t of userTasks) {
            await ensureTaskPeriodIsCurrent(user.uid, t);
            await ensureTaskYearIsCurrent(user.uid, t);
        }

        // refetch after potential updates
        userTasks = await getTasks(user.uid, false);

        // ordenar pelo horário (ex: "08:30", "14:00")
        userTasks.sort((a, b) => {
            const [ah, am] = a.schedule.split(":").map(Number);
            const [bh, bm] = b.schedule.split(":").map(Number);
            return ah * 60 + am - (bh * 60 + bm);
        });

        setTasks(userTasks);

        // também buscar se já foi concluída hoje
        const today = new Date().toISOString().split("T")[0];
        const status: Record<string, string | null> = {};

        for (const task of userTasks) {
            const log = await getTaskLogByDate(user.uid, task.id!, today);
            status[task.id!] = log ? log.id! : null;
        }

        setDoneToday(status);
        setLoading(false);
    };

    useEffect(() => {
        fetchTasks();
    }, [user]);

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date();
            const midnight = new Date();
            midnight.setHours(24, 0, 0, 0); // próxima meia-noite

            const diff = midnight.getTime() - now.getTime();

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        };

        updateTimer(); // inicializa já com o valor
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval); // limpa quando desmonta
    }, []);

    useEffect(() => {
        const fetchCounter = async () => {
            if (user) {
                setCounter(await getDailyCounter(user.uid));
            }
        };
        fetchCounter();
    }, [user]);


    const getRandomString = (): string => ['Parabéns 👏', 'Muagra 🙌'][Math.floor(Math.random() * 2)];

    async function addCounter() {
        if (user) {
            const newValue = await incrementDailyCounter(user.uid);
            setCounter(newValue);
            setSnackbarMessage(getRandomString)
            setSeverity('success')
            setSnackbar(true)
        }
    }


    const handleToggleTask = async (task: Task) => {
        if (!user || !task.id) return;

        const logId = doneToday[task.id];

        if (logId) {
            // Desmarcar
            await deleteTaskLog(user.uid, logId);
            setDoneToday((prev) => ({ ...prev, [task.id!]: null }));

            await updateTask(user.uid, task.id, {
                days: (task.days ?? 0) - 1,
                daysYear: (task.daysYear ?? 0) - 1, // 👈 decrementa
            });
        } else {
            // Marcar como feito
            const value = task.dailyGoal;
            const newLogId = await addTaskLog(
                user.uid,
                { taskId: task.id!, userId: user.uid, doneAt: new Date(), value, measure: task.measure || '', taskName: task.name },
                task.name,
                task.measure || ''
            );
            setDoneToday((prev) => ({ ...prev, [task.id!]: newLogId }));

            await updateTask(user.uid, task.id, {
                days: (task.days ?? 0) + 1,
                daysYear: (task.daysYear ?? 0) + 1, // 👈 incrementa
            });
        }
    };

    const confirmArchiveTask = async () => {
        if (!user || !selectedTask?.id) return;
        await archiveTask(user.uid, selectedTask.id);
        setOpenModal(false);
        setSelectedTask(null);
        await fetchTasks();
    };


    return {
        confirmArchiveTask,
        handleToggleTask,
        setOpenModal,
        setSelectedTask,
        setConfirmModalOpen,
        setGoalValue,
        openConfirmModal,
        confirmToggleTask,
        addCounter,
        snackbar,
        setSnackbar,
        snackbarMessage,
        severity,
        counter,
        goalType,
        confirmModalOpen,
        goalValue,
        timeLeft,
        selectedTask,
        doneToday,
        tasks,
        loading,
        openModal,
    }

}
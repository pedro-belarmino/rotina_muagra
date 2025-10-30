import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getTaskLogByDate, deleteTaskLog, addTaskLog } from "../../service/taskLogService";
import { getTasks, archiveTask, ensureTaskPeriodIsCurrent, ensureTaskYearIsCurrent, updateTask, updateTaskPriority } from "../../service/taskService";
import type { Task } from "../../types/Task";
import { getDailyCounter, incrementDailyCounter, updateDailyComment } from "../../service/counterService";
import type { SeverityType } from "../shared/SharedSnackbar";


export const useDailyTasksController = () => {

    const { user } = useAuth();
    const [timeLeft, setTimeLeft] = useState("");
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);
    const [doneToday, setDoneToday] = useState<Record<string, string | null>>({});
    const [openModal, setOpenModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [goalValue, setGoalValue] = useState<number | string>("");
    const [goalType, setGoalType] = useState<string>("");
    const [counter, setCounter] = useState<number>(0)
    const [comment, setComment] = useState("");
    const [commentLenght, setCommentLenght] = useState(0)

    const [snackbar, setSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [severity, setSeverity] = useState<SeverityType>('info');

    const [diarModal, setDiaryModal] = useState(false)

    useEffect(() => {
        setCommentLenght(comment.length);
    }, [comment])

    const openConfirmModal = (task: Task) => {
        setSelectedTask(task);
        setGoalValue(task.dailyGoal);
        setGoalType(task.measure || '')
        setConfirmModalOpen(true);
    };

    const confirmToggleTask = async () => {
        if (!user || !selectedTask?.id) return;

        const logId = doneToday[selectedTask.id];
        const value = Number(goalValue ?? selectedTask.dailyGoal ?? 0);

        if (logId) {
            await deleteTaskLog(user.uid, logId);
            setDoneToday((prev) => ({ ...prev, [selectedTask.id!]: null }));

            await updateTask(user.uid, selectedTask.id, {
                days: (selectedTask.days ?? 0) - 1,
                daysYear: (selectedTask.daysYear ?? 0) - 1,
                totalMonth: (selectedTask.totalMonth ?? 0) - value,
                totalYear: (selectedTask.totalYear ?? 0) - value,
            });
        } else {
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
                totalMonth: (selectedTask.totalMonth ?? 0) + value,
                totalYear: (selectedTask.totalYear ?? 0) + value,
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


        for (const t of userTasks) {
            await ensureTaskPeriodIsCurrent(user.uid, t);
            await ensureTaskYearIsCurrent(user.uid, t);
        }


        userTasks = await getTasks(user.uid, false);


        userTasks.sort((a, b) => {

            if (a.priority && !b.priority) return -1;
            if (!a.priority && b.priority) return 1;


            if (a.priority && b.priority) {
                return b.priority.toMillis() - a.priority.toMillis();
            }


            const [ah, am] = a.schedule.split(":").map(Number);
            const [bh, bm] = b.schedule.split(":").map(Number);
            return ah * 60 + am - (bh * 60 + bm);
        });

        setTasks(userTasks);


        // const today = new Date().toISOString().split("T")[0];


        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;


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
            midnight.setHours(24, 0, 0, 0);

            const diff = midnight.getTime() - now.getTime();

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchCounter = async () => {
            if (user) {
                const { value, comment } = await getDailyCounter(user.uid);
                setCounter(value);
                setComment(comment);
            }
        };
        fetchCounter();
    }, [user]);


    const getRandomString = (): string => ['Parabéns 👏', 'Muagra 🙌'][Math.floor(Math.random() * 2)];

    async function addCounter() {
        if (user) {
            const newValue = await incrementDailyCounter(user.uid);
            setCounter(newValue);
            setSnackbarMessage(getRandomString())
            setSeverity('success')
            setSnackbar(true)
        }
    }

    async function saveComment() {
        if (user) {
            await updateDailyComment(user.uid, comment);
            setSnackbarMessage("Comentário salvo com sucesso!");
            setSeverity('success');
            setSnackbar(true);
        }
    }


    const handleToggleTask = async (task: Task) => {
        if (!user || !task.id) return;

        const logId = doneToday[task.id];

        const value = Number(goalValue ?? task.dailyGoal ?? 0);


        if (logId) {

            await deleteTaskLog(user.uid, logId);
            setDoneToday((prev) => ({ ...prev, [task.id!]: null }));

            await updateTask(user.uid, task.id, {
                days: (task.days ?? 0) - 1,
                daysYear: (task.daysYear ?? 0) - 1,
                totalMonth: (task.totalMonth ?? 0) - value,
                totalYear: (task.totalYear ?? 0) - value,
            });
        } else {

            const newLogId = await addTaskLog(
                user.uid,
                { taskId: task.id!, userId: user.uid, doneAt: new Date(), value, measure: task.measure || '', taskName: task.name },
                task.name,
                task.measure || ''
            );
            setDoneToday((prev) => ({ ...prev, [task.id!]: newLogId }));

            await updateTask(user.uid, task.id, {
                days: (task.days ?? 0) + 1,
                daysYear: (task.daysYear ?? 0) + 1,
                totalMonth: (task.totalMonth ?? 0) + value,
                totalYear: (task.totalYear ?? 0) + value,
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


    const handleTogglePriority = async (task: Task) => {
        if (!user || !task.id) return;
        await updateTaskPriority(user.uid, task.id, !task.priority);
        await fetchTasks();
    };

    return {
        handleTogglePriority,
        confirmArchiveTask,
        handleToggleTask,
        setOpenModal,
        setSelectedTask,
        setConfirmModalOpen,
        setGoalValue,
        openConfirmModal,
        confirmToggleTask,
        addCounter,
        saveComment,
        setSnackbar,
        setComment,
        setDiaryModal,
        commentLenght,
        diarModal,
        snackbarMessage,
        snackbar,
        severity,
        counter,
        comment,
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
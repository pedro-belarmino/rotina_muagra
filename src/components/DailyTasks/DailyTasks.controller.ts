import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import {
    getTaskLogsByDay, deleteTaskLog, addTaskLog,
    getTaskLogsByMonth, getTaskLogsByYear,
    getTaskLogDaysByMonth, getTaskLogDaysByYear, getTaskStreak
} from "../../service/taskLogService";
import {
    getTasks, archiveTask, ensureTaskPeriodIsCurrent,
    ensureTaskYearIsCurrent, updateTaskPriority
} from "../../service/taskService";
import type { Task } from "../../types/Task";
import {
    getDailyCounter, incrementDailyCounter,
    updateDailyComment, getMonthlyDays, getYearlyDays
} from "../../service/counterService";
import type { SeverityType } from "../shared/SharedSnackbar";
import { daysInMonth, daysInYear, formatISODate, getNowInBrasilia } from "../../utils/period";

export const useDailyTasksController = () => {
    const { user } = useAuth();
    const [timeLeft, setTimeLeft] = useState("");
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
    const [paginatedTasks, setPaginatedTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);
    const [statsLoading, setStatsLoading] = useState(false);
    const [doneToday, setDoneToday] = useState<Record<string, string | null>>({});
    const [openModal, setOpenModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [monthlyTotals, setMonthlyTotals] = useState<Record<string, number>>({});
    const [yearlyTotals, setYearlyTotals] = useState<Record<string, number>>({});
    const [monthlyLogDays, setMonthlyLogDays] = useState<Record<string, number>>({});
    const [yearlyLogDays, setYearlyLogDays] = useState<Record<string, number>>({});
    const [streaks, setStreaks] = useState<Record<string, number>>({});
    const [page, setPage] = useState(1);
    const itemsPerPage = 8;
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [goalValue, setGoalValue] = useState<number | string>("");
    const [goalType, setGoalType] = useState<string>("");
    const [counter, setCounter] = useState<number>(0);
    const [monthlyProgress, setMonthlyProgress] = useState(0);
    const [yearlyProgress, setYearlyProgress] = useState(0);
    const [monthlyDays, setMonthlyDays] = useState(0);
    const [yearlyDays, setYearlyDays] = useState(0);
    const [totalDaysInMonth, setTotalDaysInMonth] = useState(0);
    const [totalDaysInYear, setTotalDaysInYear] = useState(0);
    const [comment, setComment] = useState("");
    const [commentLenght, setCommentLenght] = useState(0);
    const [snackbar, setSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [severity, setSeverity] = useState<SeverityType>('info');
    const [diarModal, setDiaryModal] = useState(false);
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');

    // Ref para cancelar fetches de stats de páginas anteriores
    const statsAbortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        setCommentLenght(comment.length);
    }, [comment]);

    const openConfirmModal = (task: Task) => {
        setSelectedTask(task);
        setGoalValue(task.dailyGoal);
        setGoalType(task.measure || '');
        setConfirmModalOpen(true);
    };

    const confirmToggleTask = async () => {
        if (!user || !selectedTask?.id) return;

        const logId = doneToday[selectedTask.id];
        const value = Number(goalValue ?? selectedTask.dailyGoal ?? 0);

        if (logId) {
            await deleteTaskLog(user.uid, logId);
            setDoneToday((prev) => ({ ...prev, [selectedTask.id!]: null }));
        } else {
            const newLogId = await addTaskLog(
                user.uid,
                { taskId: selectedTask.id!, userId: user.uid, doneAt: new Date(), value, measure: selectedTask.measure || '', taskName: selectedTask.name },
                selectedTask.name,
                selectedTask.measure || ''
            );
            setDoneToday((prev) => ({ ...prev, [selectedTask.id!]: newLogId }));
        }

        setConfirmModalOpen(false);
        setSelectedTask(null);
        fetchTasks(true);

        // Atualiza stats só da tarefa afetada
        const now = new Date();
        const [monthlyTotal, yearlyTotal] = await Promise.all([
            getTaskLogsByMonth(user.uid, selectedTask.id, now),
            getTaskLogsByYear(user.uid, selectedTask.id, now),
        ]);
        setMonthlyTotals((prev) => ({ ...prev, [selectedTask.id!]: monthlyTotal }));
        setYearlyTotals((prev) => ({ ...prev, [selectedTask.id!]: yearlyTotal }));
    };

    const fetchTasks = async (forceRefresh = false) => {
        if (!user) return;
        setLoading(true);

        let userTasks = await getTasks(user.uid, false, forceRefresh);
        for (const t of userTasks) {
            await ensureTaskPeriodIsCurrent(user.uid, t);
            await ensureTaskYearIsCurrent(user.uid, t);
        }
        userTasks = await getTasks(user.uid, false, forceRefresh);

        userTasks.sort((a, b) => {
            if (a.priority && !b.priority) return -1;
            if (!a.priority && b.priority) return 1;
            if (a.priority && b.priority) return b.priority.toMillis() - a.priority.toMillis();
            const [ah, am] = a.schedule.split(":").map(Number);
            const [bh, bm] = b.schedule.split(":").map(Number);
            return ah * 60 + am - (bh * 60 + bm);
        });

        setTasks(userTasks);

        const now = getNowInBrasilia();
        const today = formatISODate(now);
        const logsToday = await getTaskLogsByDay(user.uid, today);
        const status: Record<string, string | null> = {};
        for (const task of userTasks) {
            const log = logsToday.find(l => l.taskId === task.id);
            status[task.id!] = log ? log.id! : null;
        }
        setDoneToday(status);
        setLoading(false);
    };

    // Ao mudar filtro ou tasks: recalcula filteredTasks e reseta para página 1
    useEffect(() => {
        const filtered = tasks.filter(task => {
            if (filter === 'pending') return !doneToday[task.id!];
            if (filter === 'completed') return !!doneToday[task.id!];
            return true;
        });
        setFilteredTasks(filtered);
        setPage(1);
    }, [tasks, filter, doneToday]);

    // Ao mudar página ou filteredTasks: calcula a fatia visível e limpa stats antigas
    useEffect(() => {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const slice = filteredTasks.slice(startIndex, endIndex);
        setPaginatedTasks(slice);

        // Limpa stats das tarefas que saíram da tela para evitar dados sujos
        const visibleIds = new Set(slice.map(t => t.id!));
        setMonthlyTotals(prev => Object.fromEntries(Object.entries(prev).filter(([id]) => visibleIds.has(id))));
        setYearlyTotals(prev => Object.fromEntries(Object.entries(prev).filter(([id]) => visibleIds.has(id))));
        setMonthlyLogDays(prev => Object.fromEntries(Object.entries(prev).filter(([id]) => visibleIds.has(id))));
        setYearlyLogDays(prev => Object.fromEntries(Object.entries(prev).filter(([id]) => visibleIds.has(id))));
        setStreaks(prev => Object.fromEntries(Object.entries(prev).filter(([id]) => visibleIds.has(id))));
    }, [filteredTasks, page]);

    // Busca stats APENAS das tarefas visíveis na página atual
    useEffect(() => {
        if (!user || paginatedTasks.length === 0) return;

        // Cancela fetch anterior se ainda estiver rodando
        if (statsAbortRef.current) statsAbortRef.current.abort();
        const controller = new AbortController();
        statsAbortRef.current = controller;

        const fetchStats = async () => {
            setStatsLoading(true);
            const now = new Date();

            const monthly: Record<string, number> = {};
            const yearly: Record<string, number> = {};
            const mDays: Record<string, number> = {};
            const yDays: Record<string, number> = {};
            const streaksData: Record<string, number> = {};

            await Promise.all(paginatedTasks.map(async (task) => {
                if (!task.id || controller.signal.aborted) return;

                const [monthlyTotal, yearlyTotal, streak] = await Promise.all([
                    getTaskLogsByMonth(user.uid, task.id, now),
                    getTaskLogsByYear(user.uid, task.id, now),
                    getTaskStreak(user.uid, task.id),
                ]);

                if (controller.signal.aborted) return;

                monthly[task.id] = monthlyTotal;
                yearly[task.id] = yearlyTotal;
                streaksData[task.id] = streak;

                if (!task.dailyGoal) {
                    const [monthlyDaysCount, yearlyDaysCount] = await Promise.all([
                        getTaskLogDaysByMonth(user.uid, task.id, now),
                        getTaskLogDaysByYear(user.uid, task.id, now),
                    ]);
                    mDays[task.id] = monthlyDaysCount;
                    yDays[task.id] = yearlyDaysCount;
                }
            }));

            if (controller.signal.aborted) return;

            // Substitui completamente (não faz spread de estado antigo)
            setMonthlyTotals(monthly);
            setYearlyTotals(yearly);
            setMonthlyLogDays(mDays);
            setYearlyLogDays(yDays);
            setStreaks(streaksData);
            setStatsLoading(false);
        };

        fetchStats();

        return () => controller.abort();
    }, [paginatedTasks, user]);

    useEffect(() => { fetchTasks(); }, [user]);

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

    const getRandomString = (): string => ['Parabéns 👏', 'Muagra 🙌'][Math.floor(Math.random() * 2)];

    const fetchCounters = async () => {
        if (user) {
            const now = new Date();
            const { value, comment } = await getDailyCounter(user.uid);
            const monthly = await getMonthlyDays(user.uid, now);
            const yearly = await getYearlyDays(user.uid, now);
            const totalMonthDays = daysInMonth(now.getFullYear(), now.getMonth() + 1);
            const totalYearDays = daysInYear(now.getFullYear());
            setCounter(value);
            setComment(comment);
            setMonthlyDays(monthly);
            setYearlyDays(yearly);
            setTotalDaysInMonth(totalMonthDays);
            setTotalDaysInYear(totalYearDays);
            if (totalMonthDays > 0) setMonthlyProgress((monthly / totalMonthDays) * 100);
            if (totalYearDays > 0) setYearlyProgress((yearly / totalYearDays) * 100);
        }
    };

    useEffect(() => { fetchCounters(); }, [user]);

    async function addCounter() {
        if (user) {
            const newValue = await incrementDailyCounter(user.uid);
            setCounter(newValue);

            const gratitudeTasks = tasks.filter(t => t.taskType === 'gratitude');
            if (gratitudeTasks.length > 0) {
                const activeTask = [...gratitudeTasks].sort((a, b) => {
                    const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                    const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                    return dateB.getTime() - dateA.getTime();
                })[0];
                if (activeTask.id) {
                    await addTaskLog(
                        user.uid,
                        { taskId: activeTask.id, userId: user.uid, doneAt: new Date(), value: 1, measure: activeTask.measure || '', taskName: activeTask.name },
                        activeTask.name,
                        activeTask.measure || ''
                    );
                }
            }
            await fetchCounters();
            setSnackbarMessage(getRandomString());
            setSeverity('success');
            setSnackbar(true);
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
        } else {
            const newLogId = await addTaskLog(
                user.uid,
                { taskId: task.id!, userId: user.uid, doneAt: new Date(), value, measure: task.measure || '', taskName: task.name },
                task.name,
                task.measure || ''
            );
            setDoneToday((prev) => ({ ...prev, [task.id!]: newLogId }));
        }

        fetchTasks(true);
        const now = new Date();
        const [monthlyTotal, yearlyTotal] = await Promise.all([
            getTaskLogsByMonth(user.uid, task.id, now),
            getTaskLogsByYear(user.uid, task.id, now),
        ]);
        setMonthlyTotals((prev) => ({ ...prev, [task.id!]: monthlyTotal }));
        setYearlyTotals((prev) => ({ ...prev, [task.id!]: yearlyTotal }));
    };

    const confirmArchiveTask = async () => {
        if (!user || !selectedTask?.id) return;
        await archiveTask(user.uid, selectedTask.id);
        setOpenModal(false);
        setSelectedTask(null);
        await fetchTasks(true);
    };

    const handleTogglePriority = async (task: Task) => {
        if (!user || !task.id) return;
        await updateTaskPriority(user.uid, task.id, !task.priority);
        await fetchTasks(true);
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
        monthlyProgress,
        yearlyProgress,
        monthlyDays,
        yearlyDays,
        totalDaysInMonth,
        totalDaysInYear,
        comment,
        goalType,
        confirmModalOpen,
        goalValue,
        timeLeft,
        selectedTask,
        doneToday,
        tasks,
        loading,
        statsLoading, // ← agora exposto
        openModal,
        monthlyTotals,
        yearlyTotals,
        monthlyLogDays,
        yearlyLogDays,
        streaks,
        filter,
        setFilter,
        page,
        setPage,
        paginatedTasks,
        filteredTasks,
    };
};
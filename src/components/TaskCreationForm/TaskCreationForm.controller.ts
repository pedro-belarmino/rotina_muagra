import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { addTask, getTasks } from "../../service/taskService";
import { getAllTaskLogs } from "../../service/taskLogService";
import type { Task } from "../../types/Task";
import type { SeverityType } from "../../components/shared/SharedSnackbar";
import { useNavigate } from "react-router-dom";

const PHASE_SEQUENCE = [
    { key: 'semente', label: 'Semente', target: 20 },
    { key: 'broto', label: 'Broto', target: 40 },
    { key: 'flor', label: 'Flor', target: 80 },
    { key: 'fruto', label: 'Fruto', target: 120 },
    { key: 'arvore', label: 'Árvore', target: 160 },
    { key: 'floresta', label: 'Floresta', target: 200 },
    { key: 'guardiao', label: 'Guardião', target: 240 },
    { key: 'infinito', label: 'Infinito', target: 280 },
];

export function useTaskController() {
    const { user, isAuthorized, isAuthorizedPartial } = useAuth();

    const initialTaskType = isAuthorizedPartial && !isAuthorized ? 'gratitude' : 'personal';

    const [task, setTask] = useState<Task>({
        name: "",
        description: "",
        measure: "",
        dailyGoal: 0,
        totalGoal: 0,
        totalGoalType: 'monthly',
        createdAt: null,
        schedule: "",
        dailyTask: true,
        archived: false,
        taskType: initialTaskType,
        gratitudeTrack: '',
        icon: "",
        // days: []
    });

    const resetForm = () => {
        setTask({
            name: "",
            description: "",
            measure: "",
            dailyGoal: 0,
            totalGoal: 0,
            totalGoalType: 'monthly',
            createdAt: null,
            schedule: "",
            dailyTask: true,
            archived: false,
            taskType: initialTaskType,
            gratitudeTrack: '',
            icon: "",
            // days: []
        });
    };

    const resetDailyGoals = () => {
        setTask((prev) => ({
            ...prev,
            measure: '',
            dailyGoal: 0,
            totalGoal: 0,
        }))
        setDefineGeneralGoal(false)
    }

    const resetGeneralGoals = () => {
        setTask((prev) => ({
            ...prev,
            totalGoal: 0,
        }))
    }

    const [snackbar, setSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [severity, setSeverity] = useState<SeverityType>('info');

    const [defineDailyGoal, setDefineDailyGoal] = useState(false)
    const [defineGeneralGoal, setDefineGeneralGoal] = useState(false)

    const navigate = useNavigate()


    const handleChange = (field: string, value: any) => {

        if (field === 'name') {
            const limitedValue = value.slice(0, 30);
            setTask((prev) => ({
                ...prev,
                name: limitedValue
            }));
            return
        }

        if (field === "dailyGoal" || field === "totalGoal") {
            // Se o usuário apagar, deixa como string vazia
            if (value === "" || value === null) {
                setTask((prev) => ({ ...prev, [field]: "" }));
                return;
            }

            let numericValue = Number(value);

            if (field === "dailyGoal" && task.measure === "minute" && numericValue > 59) {
                setSnackbar(true);
                setSnackbarMessage('Para valores a partir de 60 minutos, selecione a medida em horas.');
                setSeverity('warning');
                numericValue = 59;
            }
            if (field === "dailyGoal" && task.measure === "hour" && numericValue > 23) {
                setSnackbar(true);
                setSnackbarMessage('Você selecionou horas muito altas, selecione um valor realista.');
                setSeverity('warning');
                numericValue = 0;
            }

            setTask((prev) => ({ ...prev, [field]: numericValue }));
        } else if (field === "measure") {
            setTask((prev) => {
                let updated = { ...prev, measure: value };

                if (value === "minute" && Number(updated.dailyGoal) > 59) {
                    setSnackbar(true);
                    setSnackbarMessage('Para valores a partir de 60 minutos, selecione a medida em horas.');
                    setSeverity('warning');
                    updated.dailyGoal = 59;
                }

                if (value === "hour" && Number(updated.dailyGoal) > 59) {
                    setSnackbar(true);
                    setSnackbarMessage('Você selecionou horas muito altas, selecione um valor realista.');
                    setSeverity('warning');
                    updated.dailyGoal = 0;
                }

                return updated;
            });
        } else if (field === "taskType" && value === "personal") {
            setTask((prev) => ({
                ...prev,
                taskType: value,
                gratitudeTrack: '',
            }));
        } else {
            setTask((prev) => ({ ...prev, [field]: value }));
        }
    };





    const handleSave = async () => {
        if (!user) {
            alert("Você não está logado. Você será redirecionado para o login");
            navigate('')
            return;
        }

        if (isAuthorizedPartial && !isAuthorized && task.taskType !== 'gratitude') {
            setSnackbar(true);
            setSnackbarMessage('Você tem acesso apenas para criar tarefas da trilha.');
            setSeverity('error');
            return;
        }

        if (!task.name) {
            setSnackbar(true);
            setSnackbarMessage('Insira o nome da tarefa');
            setSeverity('error');
            return;
        }
        if (task.dailyGoal && !task.measure) {
            setSnackbar(true);
            setSnackbarMessage('Insira uma medida para sua meta.');
            setSeverity('error');
            return;
        }
        if (task.measure && !task.dailyGoal) {
            setSnackbar(true);
            setSnackbarMessage('Você inseriu uma medida. Insira também o valor da sua meta diária.');
            setSeverity('error');
            return;
        }

        if (task.taskType === 'personal' && !task.icon) {
            setSnackbar(true);
            setSnackbarMessage('Selecione um ícone para sua tarefa pessoal.');
            setSeverity('error');
            return;
        }

        if (task.taskType === 'gratitude' && !task.gratitudeTrack) {
            setSnackbar(true);
            setSnackbarMessage('Selecione a fase da trilha dessa tarefa.');
            setSeverity('error');
            return;
        }

        if (task.taskType === 'gratitude') {
            try {
                const allTasks = await getTasks(user.uid, true);
                const gratitudeTasks = allTasks.filter(t => t.taskType === 'gratitude');

                // Validation 2: Check if this phase task already exists
                const existingTask = gratitudeTasks.find(t => {
                    const track = t.gratitudeTrack;
                    if (!track) return false;
                    if (task.gratitudeTrack === 'guardião') return track === 'guardião';
                    return track === task.gratitudeTrack;
                });

                if (existingTask) {
                    setSnackbar(true);
                    setSnackbarMessage('Esta fase da trilha já foi criada.');
                    setSeverity('error');
                    return;
                }

                // Validation 1: Check if previous phase is completed
                const currentIndex = PHASE_SEQUENCE.findIndex(p => p.key === task.gratitudeTrack);
                if (currentIndex > 0) {
                    const previousPhase = PHASE_SEQUENCE[currentIndex - 1];
                    const previousTask = gratitudeTasks.find(t => {
                        const track = t.gratitudeTrack;
                        if (!track) return false;
                        if (previousPhase.key === 'guardiao') return track === 'guardião';
                        return track === previousPhase.key;
                    });

                    if (!previousTask) {
                        setSnackbar(true);
                        setSnackbarMessage(`Você precisa criar e completar a fase "${previousPhase.label}" antes de criar esta.`);
                        setSeverity('error');
                        return;
                    }

                    const allLogs = await getAllTaskLogs(user.uid);
                    const previousTaskLogs = allLogs.filter(l => l.taskId === previousTask.id);
                    const accumulatedValue = previousTaskLogs.reduce((acc, curr) => acc + curr.value, 0);

                    if (accumulatedValue < (previousPhase.target ?? 0)) {
                        setSnackbar(true);
                        setSnackbarMessage(`A fase "${previousPhase.label}" ainda não foi completada (alcançou ${accumulatedValue}/${previousPhase.target}).`);
                        setSeverity('error');
                        return;
                    }
                }
            } catch (error) {
                console.error("Erro ao validar fases da trilha:", error);
                setSnackbar(true);
                setSnackbarMessage('Erro ao validar fases da trilha');
                setSeverity('error');
                return;
            }
        }



        try {
            await addTask(user.uid, task);
            setSnackbar(true);
            setSnackbarMessage('Tarefa criada com sucesso');
            setSeverity('success');
            resetForm();
        } catch (error) {
            console.error("Erro ao salvar tarefa:", error);
            setSnackbar(true);
            setSnackbarMessage('Tivemos um erro inesperado, contate o suporte');
            setSeverity('error');
        }
    };

    return {
        task,
        snackbar,
        snackbarMessage,
        severity,
        defineGeneralGoal,
        defineDailyGoal,
        setDefineDailyGoal,
        resetGeneralGoals,
        setDefineGeneralGoal,
        resetDailyGoals,
        handleChange,
        handleSave,
        setSnackbar,
        isAuthorized,
        isAuthorizedPartial,
    };
}

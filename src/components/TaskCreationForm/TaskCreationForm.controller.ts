import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { addTask } from "../../service/taskService";
import type { Task } from "../../types/Task";
import type { SeverityType } from "../../components/shared/SharedSnackbar";
import { useNavigate } from "react-router-dom";

export function useTaskController() {
    const { user } = useAuth();

    const [task, setTask] = useState<Task>({
        name: "",
        description: "",
        measure: "",
        dailyGoal: 0,
        totalGoal: 0,
        totalGoalType: '',
        createdAt: null,
        schedule: "",
        dailyTask: true,
        archived: false,
        // days: []
    });

    const resetForm = () => {
        setTask({
            name: "",
            description: "",
            measure: "",
            dailyGoal: 0,
            totalGoal: 0,
            totalGoalType: '',
            createdAt: null,
            schedule: "",
            dailyTask: true,
            archived: false,
            // days: []
        });
    };

    const resetDailyGoals = () => {
        setTask((prev) => ({
            ...prev,
            measure: '',
            dailyGoal: 0,
            totalGoal: 0,
            totalGoalType: "",
        }))
        setDefineGeneralGoal(false)
    }

    const resetGeneralGoals = () => {
        setTask((prev) => ({
            ...prev,
            totalGoal: 0,
            totalGoalType: ''
        }))
    }

    const [snackbar, setSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [severity, setSeverity] = useState<SeverityType>('info');

    const [defineDailyGoal, setDefineDailyGoal] = useState(false)
    const [defineGeneralGoal, setDefineGeneralGoal] = useState(false)

    const navigate = useNavigate()


    const handleChange = (field: string, value: any) => {
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

            setTask((prev) => ({ ...prev, [field]: numericValue }));
        } else if (field === "measure") {
            setTask((prev) => {
                let updated = { ...prev, measure: value };

                // valida dailyGoal caso já exista valor
                if (value === "minute" && Number(updated.dailyGoal) > 59) {
                    setSnackbar(true);
                    setSnackbarMessage('Para valores a partir de 60 minutos, selecione a medida em horas.');
                    setSeverity('warning');
                    updated.dailyGoal = 59;
                }

                return updated;
            });
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
        if (task.totalGoal && !task.dailyGoal) {
            setSnackbar(true);
            setSnackbarMessage('Insira o quanto quer fazer por dia para bater a sua meta geral.');
            setSeverity('error');
            return;
        }
        if (task.measure && !task.dailyGoal) {
            setSnackbar(true);
            setSnackbarMessage('Você inseriu uma medida. Insira também o valor da sua meta diária.');
            setSeverity('error');
            return;
        }
        if (task.totalGoal && !task.totalGoalType) {
            setSnackbar(true);
            setSnackbarMessage('Adicione o período da sua tarefa geral.');
            setSeverity('error');
            return;
        }
        if (!task.totalGoal && task.totalGoalType) {
            setSnackbar(true);
            setSnackbarMessage('Você inseriu um período para sua meta geral. Insira também o valor dessa meta');
            setSeverity('error');
            return;
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
    };
}

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { addTask } from "../../service/taskService";
import type { Task } from "../../types/Task";
import type { SeverityType } from "../../components/shared/SharedSnackbar";

export function useTaskController() {
    const { user } = useAuth();

    const [task, setTask] = useState<Task>({
        name: "",
        description: "",
        measure: "",
        dailyGoal: 0,
        totalGoal: 0,
        createdAt: null,
        schedule: "",
        dailyTask: true,
        archived: false,
    });

    const [snackbar, setSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [severity, setSeverity] = useState<SeverityType>('info');

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



    const resetForm = () => {
        setTask({
            name: "",
            description: "",
            measure: "",
            dailyGoal: 0,
            totalGoal: 0,
            createdAt: null,
            schedule: "",
            dailyTask: true,
            archived: false,
        });
    };

    const handleSave = async () => {
        if (!user) {
            alert("Você precisa estar logado para criar tarefas.");
            return;
        }

        if (!task.name || !task.measure || task.dailyGoal == 0) {
            setSnackbar(true);
            setSnackbarMessage('Preencha todos os campos obrigatórios');
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
        handleChange,
        handleSave,
        setSnackbar,
    };
}

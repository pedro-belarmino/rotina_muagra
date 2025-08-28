import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getTasks } from "../service/taskService";
import { addTaskLog, deleteTaskLog, getTaskLogByDate } from "../service/taskLogService";
import type { Task } from "../types/Task";

function DailyTasks() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [doneToday, setDoneToday] = useState<Record<string, string | null>>({});
    // taskId -> logId se concluída, null se não

    useEffect(() => {
        const fetchTasks = async () => {
            if (!user) return;

            const userTasks = await getTasks(user.uid);
            setTasks(userTasks);

            // também buscar se já foi concluída hoje
            const today = new Date().toISOString().split("T")[0];
            const status: Record<string, string | null> = {};

            for (const task of userTasks) {
                const log = await getTaskLogByDate(user.uid, task.id!, today);
                status[task.id!] = log ? log.id! : null;
            }

            setDoneToday(status);
        };

        fetchTasks();
    }, [user]);

    const handleToggleTask = async (task: Task) => {
        if (!user || !task.id) return;

        // const today = new Date().toISOString().split("T")[0];
        const logId = doneToday[task.id];

        if (logId) {
            // já concluída -> desmarcar (remover log)
            await deleteTaskLog(user.uid, logId);
            setDoneToday((prev) => ({ ...prev, [task.id!]: null }));
        } else {
            // abrir modal de confirmação (por enquanto vamos direto)
            const value = task.dailyGoal; // aqui depois entra o valor editado no modal
            const newLogId = await addTaskLog(user.uid, {
                taskId: task.id!,
                doneAt: new Date(),
                value,
            });
            setDoneToday((prev) => ({ ...prev, [task.id!]: newLogId }));
        }
    };

    return (
        <div style={{ padding: 20 }}>
            <h1>Minhas Tarefas do Dia</h1>

            <ul>
                {tasks.map((task) => (
                    <li key={task.id} style={{ marginBottom: 10 }}>
                        <b>{task.schedule} - {task.name}</b> - {task.dailyGoal} {task.measure}/dia
                        <button
                            onClick={() => handleToggleTask(task)}
                            style={{
                                marginLeft: 10,
                                backgroundColor: doneToday[task.id!] ? "green" : "gray",
                                color: "white",
                                border: "none",
                                padding: "5px 10px",
                                borderRadius: "6px",
                                cursor: "pointer"
                            }}
                        >
                            {doneToday[task.id!] ? "Concluída" : "Marcar"}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default DailyTasks;

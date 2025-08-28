import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { addTask, getTasks } from "../service/taskService";
import type { Task } from "../types/Task";

function DailyTasks() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);

    // Buscar tarefas do usuário
    useEffect(() => {
        const fetchTasks = async () => {
            if (user) {
                const userTasks = await getTasks(user.uid);
                setTasks(userTasks);
            }
        };
        fetchTasks();
    }, [user]);

    const handleAddTask = async () => {
        if (!user) return;

        const newTask: Task = {
            name: "Correr",
            description: "Correr na rua",
            measure: "km",
            dailyGoal: 5,
            totalGoal: 100,
            createdAt: null,
            schedule: "07:00",
        };

        await addTask(user.uid, newTask);
        const updated = await getTasks(user.uid);
        setTasks(updated);
    };


    return (
        <div style={{ padding: 20 }}>
            <h1>Minhas Tarefas</h1>
            <button onClick={handleAddTask}>Adicionar tarefa</button>

            <ul>
                {tasks.map((task) => (
                    <li key={task.id}>
                        <b>{task.schedule} - {task.name}</b> - {task.dailyGoal} {task.measure}/dia
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default DailyTasks;

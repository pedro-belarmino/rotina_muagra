import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAllTaskLogs } from "../../service/taskLogService";
import { getTasks } from "../../service/taskService";
import type { Task } from "../../types/Task";
import type { TaskLog } from "../../types/TaskLog";

type TaskStats = {
    totalDays: number;
    streak: number;
    totalMeasure: number;
    taskName: string;
    logs: TaskLog[];
};

export const useHistoryDisplayController = () => {
    const { user } = useAuth();
    const [taskStats, setTaskStats] = useState<Record<string, TaskStats>>({});
    const [tasks, setTasks] = useState<Record<string, Task>>({});
    const [expanded, setExpanded] = useState<string | false>(false);

    const handleChange =
        (panel: string) => (_event: React.SyntheticEvent, newExpanded: boolean) => {
            setExpanded(newExpanded ? panel : false);
        };

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            const [allLogs, allTasks] = await Promise.all([
                getAllTaskLogs(user.uid),
                getTasks(user.uid, true), // 🔑 agora inclui arquivadas
            ]);


            // Map taskId -> task
            const taskMap: Record<string, Task> = {};
            allTasks.forEach((t: Task) => {
                if (t.id) {
                    taskMap[t.id] = t;
                }
            });
            setTasks(taskMap);

            // Group logs by task
            const statsByTask: Record<string, TaskStats> = {};

            allLogs.forEach((log: TaskLog) => {
                if (!statsByTask[log.taskId]) {
                    statsByTask[log.taskId] = {
                        totalDays: 0,
                        streak: 0,
                        totalMeasure: 0,
                        taskName: '',
                        logs: [],
                    };
                }
                statsByTask[log.taskId].logs.push(log);
            });

            // Calculate stats for each task
            Object.entries(statsByTask).forEach(([_taskId, stats]) => {
                // Unique days
                const dates = new Set(
                    stats.logs.map((l) =>
                        new Date(l.doneAt).toDateString()
                    )
                );
                stats.totalDays = dates.size;

                // Streak calculation
                const sortedDates = [...dates]
                    .map((d) => {
                        const date = new Date(d);
                        date.setHours(0, 0, 0, 0);
                        return date;
                    })
                    .sort((a, b) => b.getTime() - a.getTime());

                let streak = 0;
                let today = new Date();
                today.setHours(0, 0, 0, 0);

                for (const d of sortedDates) {
                    if (d.getTime() === today.getTime()) {
                        streak++;
                        today.setDate(today.getDate() - 1);
                    } else {
                        break;
                    }
                }
                stats.streak = streak;

                // Total measure
                stats.totalMeasure = stats.logs.reduce(
                    (sum, l) => sum + l.value,
                    0
                );
            });

            setTaskStats(statsByTask);
        };

        fetchData();
    }, [user]);


    return {
        taskStats,
        tasks,
        expanded,
        handleChange,
    }
}
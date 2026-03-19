import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { getTasks } from "../../service/taskService";
import { getAllTaskLogs } from "../../service/taskLogService";
import type { Task } from "../../types/Task";
import type { TaskLog } from "../../types/TaskLog";

export interface PhaseInfo {
    key: string;
    label: string;
    target?: number;
    accumulatedValue: number;
    isCreated: boolean;
    isTargetReached: boolean;
    dateReached?: string;
    iconPath: string;
}

const PHASE_CONFIG = [
    { key: 'semente', label: 'Semente', target: 20 },
    { key: 'broto', label: 'Broto', target: 40 },
    { key: 'flor', label: 'Flor', target: 80 },
    { key: 'fruto', label: 'Fruto', target: 120 },
    { key: 'arvore', label: 'Árvore', target: 160 },
    { key: 'floresta', label: 'Floresta', target: 200 },
    { key: 'guardiao', label: 'Guardião', target: 240 },
    { key: 'infinito', label: 'Infinito', target: 280 },
];

export const usePhasesController = (refreshTrigger?: any) => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [logs, setLogs] = useState<TaskLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                const [allTasks, allLogs] = await Promise.all([
                    getTasks(user.uid, true),
                    getAllTaskLogs(user.uid)
                ]);

                const gratitudeTasks = allTasks.filter(t => t.taskType === 'gratitude');
                setTasks(gratitudeTasks);
                setLogs(allLogs);
            } catch (error) {
                console.error("Error fetching phases data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, refreshTrigger]);

    const phases = useMemo(() => {
        return PHASE_CONFIG.map(config => {
            const task = tasks.find(t => {
                const track = t.gratitudeTrack;
                if (!track) return false;
                return track === config.key;
            });

            if (!task) {
                return {
                    key: config.key,
                    label: config.label,
                    target: config.target,
                    accumulatedValue: 0,
                    isCreated: false,
                    isTargetReached: false,
                    iconPath: `/icons-pb/${config.key}.png`
                };
            }

            const taskLogs = logs.filter(l => l.taskId === task.id);
            const accumulatedValue = taskLogs.reduce((acc, curr) => acc + curr.value, 0);

            let dateReached: string | undefined = undefined;
            if (config.target !== undefined && accumulatedValue >= config.target) {
                const sortedLogs = [...taskLogs].sort((a, b) => a.doneAt.getTime() - b.doneAt.getTime());
                let runningSum = 0;
                for (const log of sortedLogs) {
                    runningSum += log.value;
                    if (runningSum >= config.target) {
                        const d = log.doneAt;
                        dateReached = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
                        break;
                    }
                }
            }

            return {
                key: config.key,
                label: config.label,
                target: config.target,
                accumulatedValue,
                isCreated: true,
                isTargetReached: config.target !== undefined && accumulatedValue >= config.target,
                dateReached,
                iconPath: `/icons/${config.key}.png`
            };
        });
    }, [tasks, logs]);

    return { phases, loading };
};

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { getTasks } from "../../service/taskService";
import { getAllDailyCounters } from "../../service/counterService";
import { Task } from "../../types/Task";
import { formatISODate } from "../../utils/period";

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
    { key: 'broto', label: 'Broto', target: 60 },
    { key: 'flor', label: 'Flor', target: 140 },
    { key: 'fruto', label: 'Fruto', target: 260 },
    { key: 'arvore', label: 'Árvore', target: 420 },
    { key: 'floresta', label: 'Floresta', target: 620 },
    { key: 'guardiao', label: 'Guardião', target: undefined },
    { key: 'infinito', label: 'Infinito', target: undefined },
];

export const usePhasesController = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [counters, setCounters] = useState<{ dateKey: string; value: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                const [allTasks, allCounters] = await Promise.all([
                    getTasks(user.uid),
                    getAllDailyCounters(user.uid)
                ]);

                // Filter gratitude tasks and normalize gratitudeTrack strings
                const gratitudeTasks = allTasks.filter(t => t.taskType === 'gratitude');
                setTasks(gratitudeTasks);
                setCounters(allCounters.sort((a, b) => a.dateKey.localeCompare(b.dateKey)));
            } catch (error) {
                console.error("Error fetching phases data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const phases = useMemo(() => {
        const result: PhaseInfo[] = [];

        // Map phases to their first creation dates
        const phaseTasks = PHASE_CONFIG.map(config => {
            // Find the task for this phase. Normalize keys if necessary.
            // Some keys in MenuItem are 'guardiao' but in Task type might be 'guardião'
            const task = tasks.find(t => {
                const track = t.gratitudeTrack;
                if (!track) return false;
                if (config.key === 'guardiao') return track === 'guardiao' || track === 'guardião';
                return track === config.key;
            });

            return {
                ...config,
                createdAt: task ? (task.createdAt instanceof Date ? task.createdAt : new Date(task.createdAt)) : null,
                isCreated: !!task
            };
        });

        for (let i = 0; i < phaseTasks.length; i++) {
            const currentPhase = phaseTasks[i];

            if (!currentPhase.isCreated) {
                result.push({
                    key: currentPhase.key,
                    label: currentPhase.label,
                    target: currentPhase.target,
                    accumulatedValue: 0,
                    isCreated: false,
                    isTargetReached: false,
                    iconPath: `/icons-pb/${currentPhase.key}.png`
                });
                continue;
            }

            // Calculate active range for this phase
            const startDate = currentPhase.createdAt!;
            const startKey = formatISODate(startDate);

            // Find next phase's creation date to define end of range
            let endKey: string | null = null;
            for (let j = i + 1; j < phaseTasks.length; j++) {
                if (phaseTasks[j].isCreated) {
                    const endDate = phaseTasks[j].createdAt!;
                    endKey = formatISODate(endDate);
                    break;
                }
            }

            // Filter counters in range [startKey, endKey)
            // If endKey is same as startKey, the range might be empty or we should decide.
            // Usually if both are same day, the newer phase wins for that day.
            const phaseCounters = counters.filter(c => {
                if (c.dateKey < startKey) return false;
                if (endKey && c.dateKey >= endKey) return false;
                return true;
            });

            let accumulatedValue = 0;
            let dateReached: string | undefined = undefined;
            const target = currentPhase.target;

            for (const c of phaseCounters) {
                accumulatedValue += c.value;
                if (target !== undefined && !dateReached && accumulatedValue >= target) {
                    // Format date to DD/MM/YYYY
                    const [year, month, day] = c.dateKey.split('-');
                    dateReached = `${day}/${month}/${year}`;
                }
            }

            result.push({
                key: currentPhase.key,
                label: currentPhase.label,
                target: target,
                accumulatedValue,
                isCreated: true,
                isTargetReached: target !== undefined && accumulatedValue >= target,
                dateReached,
                iconPath: `/icons/${currentPhase.key}.png`
            });
        }

        return result;
    }, [tasks, counters]);

    return { phases, loading };
};

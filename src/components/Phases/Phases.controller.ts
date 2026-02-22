import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getTasks } from "../../service/taskService";
import { getAllDailyCounters } from "../../service/counterService";
import type { Task } from "../../types/Task";
import dayjs from "dayjs";

export const PHASE_ORDER = [
    'semente',
    'broto',
    'flor',
    'fruto',
    'arvore',
    'floresta',
    'guardiao',
    'infinito'
];

export const PHASE_TARGETS: Record<string, number> = {
    semente: 20,
    broto: 60,
    flor: 140,
    fruto: 260,
    arvore: 420,
    floresta: 620,
};

export const PHASE_LABELS: Record<string, string> = {
    semente: 'Semente',
    broto: 'Broto',
    flor: 'Flor',
    fruto: 'Fruto',
    arvore: 'Árvore',
    floresta: 'Floresta',
    guardiao: 'Guardião',
    infinito: 'Infinito'
};

export interface PhaseData {
    name: string;
    label: string;
    value: number;
    target: number | null;
    reachedDate: string | null;
    isUnlocked: boolean;
    isNextPhaseCreated: boolean;
}

export const usePhasesController = () => {
    const { user } = useAuth();
    const [phases, setPhases] = useState<PhaseData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAndCalculate = async () => {
            if (!user) return;
            setLoading(true);

            try {
                const tasks = await getTasks(user.uid);
                const gratitudeTasks = tasks
                    .filter(t => t.taskType === 'gratitude' && t.gratitudeTrack)
                    .sort((a, b) => {
                        const idxA = PHASE_ORDER.indexOf(a.gratitudeTrack as string);
                        const idxB = PHASE_ORDER.indexOf(b.gratitudeTrack as string);
                        return idxA - idxB;
                    });

                // Get only the latest task per phase in case of duplicates
                const phaseTasks: Record<string, Task> = {};
                gratitudeTasks.forEach(t => {
                    const phase = t.gratitudeTrack as string;
                    if (!phaseTasks[phase] || t.createdAt > phaseTasks[phase].createdAt) {
                        phaseTasks[phase] = t;
                    }
                });

                const counters = await getAllDailyCounters(user.uid);
                const sortedCounters = counters.sort((a, b) => a.dateKey.localeCompare(b.dateKey));

                const result: PhaseData[] = PHASE_ORDER.map((phaseName, index) => {
                    const task = phaseTasks[phaseName];
                    const nextPhaseName = PHASE_ORDER[index + 1];
                    const nextTask = nextPhaseName ? phaseTasks[nextPhaseName] : null;

                    if (!task) {
                        return {
                            name: phaseName,
                            label: PHASE_LABELS[phaseName],
                            value: 0,
                            target: PHASE_TARGETS[phaseName] || null,
                            reachedDate: null,
                            isUnlocked: false,
                            isNextPhaseCreated: !!nextTask
                        };
                    }

                    const startDate = dayjs(task.createdAt).startOf('day');
                    const endDate = nextTask ? dayjs(nextTask.createdAt).startOf('day') : null;

                    let value = 0;
                    let reachedDate: string | null = null;
                    const target = PHASE_TARGETS[phaseName] || null;

                    sortedCounters.forEach(c => {
                        const counterDate = dayjs(c.dateKey).startOf('day');

                        const isAfterStart = counterDate.isSame(startDate, 'day') || counterDate.isAfter(startDate, 'day');
                        const isBeforeEnd = endDate ? counterDate.isBefore(endDate, 'day') : true;

                        if (isAfterStart && isBeforeEnd) {
                            value += c.value;
                            if (target && value >= target && !reachedDate) {
                                reachedDate = counterDate.format('DD/MM/YYYY');
                            }
                        }
                    });

                    return {
                        name: phaseName,
                        label: PHASE_LABELS[phaseName],
                        value,
                        target,
                        reachedDate,
                        isUnlocked: true,
                        isNextPhaseCreated: !!nextTask
                    };
                });

                setPhases(result);
            } catch (error) {
                console.error("Error calculating phases:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAndCalculate();
    }, [user]);

    return { phases, loading };
};

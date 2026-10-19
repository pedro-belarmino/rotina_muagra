import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db, requireAuthorizedUser } from "../utils/auth";
import { getNowInBrasilia, getPeriodStartForType } from "../utils/timezone";
import type { CreateTaskInput, Task } from "../types";

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

export const createTask = onCall({ maxInstances: 10 }, async (request) => {
    const { uid, isAuthorized, isAuthorizedPartial } = await requireAuthorizedUser(request);
    const data = request.data as CreateTaskInput;

    if (isAuthorizedPartial && !isAuthorized && data.taskType !== 'gratitude') {
        throw new HttpsError(
            'permission-denied',
            'Você tem acesso apenas para criar tarefas da trilha.'
        );
    }

    if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
        throw new HttpsError('invalid-argument', 'Insira o nome da tarefa.');
    }

    const taskName = data.name.trim().slice(0, 30);

    if (data.dailyGoal && !data.measure) {
        throw new HttpsError('invalid-argument', 'Insira uma medida para sua meta.');
    }

    if (data.measure && !data.dailyGoal) {
        throw new HttpsError('invalid-argument', 'Insira também o valor da sua meta diária.');
    }

    if (data.taskType === 'personal' && !data.icon) {
        throw new HttpsError('invalid-argument', 'Selecione um ícone para sua tarefa pessoal.');
    }

    if (data.taskType === 'gratitude' && !data.gratitudeTrack) {
        throw new HttpsError('invalid-argument', 'Selecione a fase da trilha dessa tarefa.');
    }

    if (data.taskType === 'gratitude') {
        const tasksSnap = await db.collection("users").doc(uid).collection("tasks").get();
        const allTasks = tasksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Task[];
        const gratitudeTasks = allTasks.filter(t => t.taskType === 'gratitude');

        const existingTask = gratitudeTasks.find(t => t.gratitudeTrack === data.gratitudeTrack);
        if (existingTask) {
            throw new HttpsError('already-exists', 'Esta fase da trilha já foi criada.');
        }

        const currentIndex = PHASE_SEQUENCE.findIndex(p => p.key === data.gratitudeTrack);
        if (currentIndex > 0) {
            const previousPhase = PHASE_SEQUENCE[currentIndex - 1];
            const previousTask = gratitudeTasks.find(t => t.gratitudeTrack === previousPhase.key);

            if (!previousTask || !previousTask.id) {
                throw new HttpsError(
                    'failed-precondition',
                    `Você precisa criar e completar a fase "${previousPhase.label}" antes de criar esta.`
                );
            }

            const logsSnap = await db.collection("users").doc(uid).collection("taskLogs")
                .where("taskId", "==", previousTask.id)
                .get();

            const accumulatedValue = logsSnap.docs.reduce((acc, doc) => acc + (doc.data().value || 0), 0);

            if (accumulatedValue < (previousPhase.target ?? 0)) {
                throw new HttpsError(
                    'failed-precondition',
                    `A fase "${previousPhase.label}" ainda não foi completada (alcançou ${accumulatedValue}/${previousPhase.target}).`
                );
            }
        }
    }

    const now = getNowInBrasilia();
    const periodStart = getPeriodStartForType(now, data.totalGoalType);
    const serverTimestamp = new Date();

    const newTask: Omit<Task, 'id'> = {
        name: taskName,
        description: data.description || '',
        measure: data.measure || '',
        dailyGoal: data.dailyGoal ?? 0,
        totalGoal: data.totalGoal ?? 0,
        totalGoalType: data.totalGoalType || 'monthly',
        createdAt: serverTimestamp,
        schedule: data.schedule || '08:00',
        dailyTask: data.dailyTask ?? true,
        archived: false,
        days: 0,
        periodStart: periodStart ?? null,
        daysYear: 0,
        yearStart: String(now.getFullYear()),
        totalMonth: 0,
        totalYear: 0,
        taskType: data.taskType || 'personal',
        gratitudeTrack: data.gratitudeTrack || '',
        icon: data.icon || '',
    };

    const docRef = await db.collection("users").doc(uid).collection("tasks").add(newTask);

    return { id: docRef.id, ...newTask };
});

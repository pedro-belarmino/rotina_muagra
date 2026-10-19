import { db, functions } from "../firebase/config";
import {
    collection,
    getDocs,
    getDocsFromCache,
    getDocsFromServer,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import type { Task } from "../types/Task";

export async function addTask(_userId: string, task: Task) {
    const createTaskFn = httpsCallable<any, Task>(functions, "createTask");
    const response = await createTaskFn({
        name: task.name,
        description: task.description,
        measure: task.measure,
        dailyGoal: task.dailyGoal,
        totalGoal: task.totalGoal,
        totalGoalType: task.totalGoalType,
        schedule: task.schedule,
        dailyTask: task.dailyTask,
        taskType: task.taskType,
        gratitudeTrack: task.gratitudeTrack,
        icon: task.icon,
    });

    await getTasks(_userId, false, true);
    return response.data;
}

export async function getTasks(userId: string, includeArchived = false, forceRefresh = false): Promise<Task[]> {
    const tasksRef = collection(db, "users", userId, "tasks");

    let snapshot;
    if (forceRefresh) {
        snapshot = await getDocsFromServer(tasksRef);
    } else {
        try {
            snapshot = await getDocsFromCache(tasksRef);
            if (snapshot.empty) {
                snapshot = await getDocs(tasksRef);
            }
        } catch (error) {
            console.warn("Failed to fetch from cache, falling back to network", error);
            snapshot = await getDocs(tasksRef);
        }
    }

    return snapshot.docs
        .map((docSnap) => {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
                days: data.days ?? 0,
                periodStart: data.periodStart ?? null,
                daysYear: data.daysYear ?? 0,
                yearStart: data.yearStart ?? null,
                totalMonth: data.totalMonth ?? 0,
                totalYear: data.totalYear ?? 0,
            } as Task;
        })
        .filter((task) => includeArchived || !task.archived);
}

export async function updateTask(userId: string, taskId: string, updates: Partial<Task>) {
    const updateTaskFn = httpsCallable<any, { success: boolean }>(functions, "updateTask");
    await updateTaskFn({ taskId, updates });

    if (updates.archived === false) {
        await getTasks(userId, false, true);
    }
}

export async function updateTaskPriority(_userId: string, taskId: string, isPriority: boolean) {
    const updateTaskFn = httpsCallable<any, { success: boolean }>(functions, "updateTask");
    await updateTaskFn({ taskId, updates: { priority: isPriority } });
}

export async function ensureTaskPeriodIsCurrent(_userId: string, _task: Task): Promise<boolean> {
    const ensureFn = httpsCallable<any, { updatedCount: number }>(functions, "ensureTaskPeriods");
    const res = await ensureFn();
    return res.data.updatedCount > 0;
}

export async function ensureTaskYearIsCurrent(_userId: string, _task: Task): Promise<boolean> {
    const ensureFn = httpsCallable<any, { updatedCount: number }>(functions, "ensureTaskPeriods");
    const res = await ensureFn();
    return res.data.updatedCount > 0;
}

export async function archiveTask(userId: string, taskId: string) {
    const updateTaskFn = httpsCallable<any, { success: boolean }>(functions, "updateTask");
    await updateTaskFn({ taskId, updates: { archived: true } });
    await getTasks(userId, false, true);
}

export async function deleteTaskPermanently(userId: string, taskId: string) {
    const deleteTaskFn = httpsCallable<any, { success: boolean }>(functions, "deleteTask");
    await deleteTaskFn({ taskId });
    await getTasks(userId, false, true);
}

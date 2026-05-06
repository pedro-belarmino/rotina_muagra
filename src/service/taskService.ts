import { db } from "../firebase/config";
import {
    collection,
    addDoc,
    getDocs,
    getDocsFromCache,
    getDocsFromServer,
    Timestamp,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,


} from "firebase/firestore";
import type { Task } from "../types/Task";
import { getNowInBrasilia, getPeriodStartForType } from "../utils/period";


export async function addTask(userId: string, task: Task) {
    const tasksRef = collection(db, "users", userId, "tasks");
    const now = getNowInBrasilia();
    const periodStart = getPeriodStartForType(now, task.totalGoalType as any);
    let now2 = new Date()
    await addDoc(tasksRef, {
        ...task,
        createdAt: now2,
        archived: false,
        days: 0,
        periodStart: periodStart ?? null,
        daysYear: 0,
        yearStart: String(now.getFullYear()),
        totalMonth: 0,
        totalYear: 0,
    });
    // Força a atualização do cache após adicionar uma nova tarefa
    await getTasks(userId, false, true);
}


export async function getTasks(userId: string, includeArchived = false, forceRefresh = false): Promise<Task[]> {
    const tasksRef = collection(db, "users", userId, "tasks");

    let snapshot;
    if (forceRefresh) {
        snapshot = await getDocsFromServer(tasksRef);
    } else {
        try {
            snapshot = await getDocsFromCache(tasksRef);
            // Se o cache estiver vazio, busca do servidor
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
    const taskRef = doc(db, "users", userId, "tasks", taskId);
    await updateDoc(taskRef, updates);
    // Se estiver desarquivando, forçamos a atualização do cache
    if (updates.archived === false) {
        await getTasks(userId, false, true);
    }
}


export async function updateTaskPriority(userId: string, taskId: string, isPriority: boolean) {
    const taskRef = doc(db, "users", userId, "tasks", taskId);
    const priorityValue = isPriority ? Timestamp.now() : null;
    await updateDoc(taskRef, { priority: priorityValue });
}



export async function ensureTaskPeriodIsCurrent(userId: string, task: Task): Promise<boolean> {
    if (!task || !task.id) return false;
    const now = getNowInBrasilia();
    const currentPeriodStart = getPeriodStartForType(now, task.totalGoalType as any);

    if (!currentPeriodStart) {

        if (task.periodStart) {
            await updateTask(userId, task.id, { periodStart: null, days: task.days ?? 0, totalMonth: 0, });
            return true;
        }
        return false;
    }

    if (task.periodStart !== currentPeriodStart) {

        await updateTask(userId, task.id, { days: 0, periodStart: currentPeriodStart });
        return true;
    }
    return false;
}

export async function ensureTaskYearIsCurrent(userId: string, task: Task): Promise<boolean> {
    if (!task || !task.id) return false;
    const now = getNowInBrasilia();
    const currentYear = String(now.getFullYear());

    if (task.yearStart !== currentYear) {

        await updateTask(userId, task.id, { daysYear: 0, yearStart: currentYear, totalYear: 0, });
        return true;
    }
    return false;
}



export async function archiveTask(userId: string, taskId: string) {
    const taskRef = doc(db, "users", userId, "tasks", taskId);
    await updateDoc(taskRef, { archived: true });
    // Força a atualização do cache após arquivar uma tarefa
    await getTasks(userId, false, true);
}


export async function deleteTaskPermanently(userId: string, taskId: string) {

    const taskRef = doc(db, "users", userId, "tasks", taskId);
    await deleteDoc(taskRef);


    const logsRef = collection(db, "users", userId, "taskLogs");
    const q = query(logsRef, where("taskId", "==", taskId));
    const snapshot = await getDocs(q);

    const batchDeletes = snapshot.docs.map((logDoc) =>
        deleteDoc(logDoc.ref)
    );

    await Promise.all(batchDeletes);
    // Força a atualização do cache após excluir permanentemente uma tarefa
    await getTasks(userId, false, true);
}
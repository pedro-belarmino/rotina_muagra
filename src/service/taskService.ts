import { db } from "../firebase/config";
import {
    collection,
    addDoc,
    getDocs,
    Timestamp,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    // orderBy,
    // limit,
} from "firebase/firestore";
import type { Task } from "../types/Task";
import { getPeriodStartForType } from "../utils/period";

// Adicionar tarefa
export async function addTask(userId: string, task: Task) {
    const tasksRef = collection(db, "users", userId, "tasks");
    const now = new Date();
    const periodStart = getPeriodStartForType(now, task.totalGoalType as any);
    await addDoc(tasksRef, {
        ...task,
        createdAt: Timestamp.now(),
        archived: false,
        days: 0,
        periodStart: periodStart ?? null,
        daysYear: 0, //  inicializa contador anual
        yearStart: String(now.getFullYear()), //  marca ano atual
        totalMonth: 0,
        totalYear: 0,
    });
}

// Listar tarefas
export async function getTasks(userId: string, includeArchived = false): Promise<Task[]> {
    const tasksRef = collection(db, "users", userId, "tasks");
    const snapshot = await getDocs(tasksRef);

    return snapshot.docs
        .map((docSnap) => {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
                days: data.days ?? 0,
                periodStart: data.periodStart ?? null,
                daysYear: data.daysYear ?? 0,      // garante que vem do Firestore
                yearStart: data.yearStart ?? null,
                totalMonth: data.totalMonth ?? 0,   // 👈 garante que vem
                totalYear: data.totalYear ?? 0,     // 👈 garante que vem
            } as Task;
        })
        .filter((task) => includeArchived || !task.archived);
}


// Atualizar tarefa
export async function updateTask(userId: string, taskId: string, updates: Partial<Task>) {
    const taskRef = doc(db, "users", userId, "tasks", taskId);
    await updateDoc(taskRef, updates);
}

// Função util: verifica se o período da tarefa ainda corresponde ao período corrente
// Se mudou -> reseta days para 0 e atualiza periodStart. Retorna true se atualizou.
export async function ensureTaskPeriodIsCurrent(userId: string, task: Task): Promise<boolean> {
    if (!task || !task.id) return false;
    const now = new Date();
    const currentPeriodStart = getPeriodStartForType(now, task.totalGoalType as any);
    // se tarefa não tem tipo de período (general, etc.), nada a fazer
    if (!currentPeriodStart) {
        // ainda podemos normalizar periodStart para null
        if (task.periodStart) {
            await updateTask(userId, task.id, { periodStart: null, days: task.days ?? 0, totalMonth: 0, });
            return true;
        }
        return false;
    }

    if (task.periodStart !== currentPeriodStart) {
        // período mudou: resetar days para 0 e atualizar periodStart
        await updateTask(userId, task.id, { days: 0, periodStart: currentPeriodStart });
        return true;
    }
    return false;
}

export async function ensureTaskYearIsCurrent(userId: string, task: Task): Promise<boolean> {
    if (!task || !task.id) return false;
    const now = new Date();
    const currentYear = String(now.getFullYear());

    if (task.yearStart !== currentYear) {
        // mudou o ano → resetar diasYear
        await updateTask(userId, task.id, { daysYear: 0, yearStart: currentYear, totalYear: 0, });
        return true;
    }
    return false;
}


// Arquivar tarefa (em vez de deletar)
export async function archiveTask(userId: string, taskId: string) {
    const taskRef = doc(db, "users", userId, "tasks", taskId);
    await updateDoc(taskRef, { archived: true });
}

//  Se quiser realmente apagar do Firestore
export async function deleteTaskPermanently(userId: string, taskId: string) {
    // 1. Apagar a própria tarefa
    const taskRef = doc(db, "users", userId, "tasks", taskId);
    await deleteDoc(taskRef);

    // 2. Buscar e apagar todos os logs daquela tarefa
    const logsRef = collection(db, "users", userId, "taskLogs");
    const q = query(logsRef, where("taskId", "==", taskId));
    const snapshot = await getDocs(q);

    const batchDeletes = snapshot.docs.map((logDoc) =>
        deleteDoc(logDoc.ref)
    );

    await Promise.all(batchDeletes);
}
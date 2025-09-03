import { db } from "../firebase/config";
import {
    collection,
    addDoc,
    getDocs,
    Timestamp,
    doc,
    updateDoc,
    deleteDoc,
    // query,
    // orderBy,
    // limit,
} from "firebase/firestore";
import type { Task } from "../types/Task";

// Adicionar tarefa
export async function addTask(userId: string, task: Task) {
    const tasksRef = collection(db, "users", userId, "tasks");
    await addDoc(tasksRef, {
        ...task,
        createdAt: Timestamp.now(),
        archived: false, // 🔹 nova flag
    });
}

// Listar tarefas
export async function getTasks(userId: string, includeArchived = false): Promise<Task[]> {
    const tasksRef = collection(db, "users", userId, "tasks");
    const snapshot = await getDocs(tasksRef);

    return snapshot.docs
        .map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
            } as Task;
        })
        .filter((task) => includeArchived || !task.archived); // 🔑 filtra arquivadas se não pedir
}


// Atualizar tarefa
export async function updateTask(userId: string, taskId: string, updates: Partial<Task>) {
    const taskRef = doc(db, "users", userId, "tasks", taskId);
    await updateDoc(taskRef, updates);
}

// Arquivar tarefa (em vez de deletar)
export async function archiveTask(userId: string, taskId: string) {
    const taskRef = doc(db, "users", userId, "tasks", taskId);
    await updateDoc(taskRef, { archived: true });
}

// ⚠️ Se quiser realmente apagar do Firestore
export async function deleteTaskPermanently(userId: string, taskId: string) {
    const taskRef = doc(db, "users", userId, "tasks", taskId);
    await deleteDoc(taskRef);
}

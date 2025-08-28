import { db } from "../firebase/config";
import {
    collection,
    addDoc,
    getDocs,
    //   query,
    //   where,
    Timestamp,
    doc,
    updateDoc,
    deleteDoc,
} from "firebase/firestore";
import type { Task } from "../types/Task";

// Adicionar tarefa
export async function addTask(userId: string, task: Task) {
    const tasksRef = collection(db, "users", userId, "tasks");
    await addDoc(tasksRef, {
        ...task,
        createdAt: Timestamp.now(),
    });
}

// Listar tarefas
export async function getTasks(userId: string): Promise<Task[]> {
    const tasksRef = collection(db, "users", userId, "tasks");
    const snapshot = await getDocs(tasksRef);
    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Task[];
}

// Atualizar tarefa
export async function updateTask(userId: string, taskId: string, updates: Partial<Task>) {
    const taskRef = doc(db, "users", userId, "tasks", taskId);
    await updateDoc(taskRef, updates);
}

// Deletar tarefa
export async function deleteTask(userId: string, taskId: string) {
    const taskRef = doc(db, "users", userId, "tasks", taskId);
    await deleteDoc(taskRef);
}

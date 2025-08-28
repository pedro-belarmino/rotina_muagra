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
    query,
    orderBy,
    limit,
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



import { serverTimestamp } from "firebase/firestore";

export const addTaskHistory = async (
    userId: string,
    taskId: string,
    value: number
) => {
    try {
        const historyRef = await addDoc(
            collection(db, "users", userId, "tasks", taskId, "history"),
            {
                taskId,
                doneAt: serverTimestamp(),
                value,
            }
        );

        console.log("Histórico registrado:", historyRef.id);
        return historyRef.id;
    } catch (error) {
        console.error("Erro ao salvar histórico:", error);
        throw error;
    }
};


// Marcar tarefa como feita
export const completeTask = async (userId: string, taskId: string, value: number) => {
    const historyRef = await addDoc(
        collection(db, "users", userId, "tasks", taskId, "history"),
        {
            taskId,
            value,
            doneAt: new Date(),
        }
    );
    return historyRef.id;
};

// Desmarcar (apagar último registro)
export const undoTask = async (userId: string, taskId: string) => {
    const q = query(
        collection(db, "users", userId, "tasks", taskId, "history"),
        orderBy("doneAt", "desc"),
        limit(1) // pega o último registro
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
        await deleteDoc(doc(db, "users", userId, "tasks", taskId, "history", snapshot.docs[0].id));
    }
};
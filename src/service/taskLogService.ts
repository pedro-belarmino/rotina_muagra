import {
    collection,
    addDoc,
    deleteDoc,
    getDocs,
    query,
    where,
    Timestamp,
    doc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import type { TaskLog } from "../types/TaskLog";

// Adicionar log com snapshot da tarefa
export const addTaskLog = async (
    uid: string,
    log: TaskLog,
    taskName: string,
    measure: string
) => {
    const logsRef = collection(db, "users", uid, "taskLogs");
    const docRef = await addDoc(logsRef, {
        taskId: log.taskId,
        taskName,          // snapshot
        measure,           // snapshot
        doneAt: Timestamp.fromDate(log.doneAt),
        value: log.value,
        userId: uid,
    });
    return docRef.id;
};

// Deletar log (se realmente necessário)
export const deleteTaskLog = async (uid: string, logId: string) => {
    const logRef = doc(db, "users", uid, "taskLogs", logId);
    await deleteDoc(logRef);
};

// Buscar log por taskId e data
export const getTaskLogByDate = async (
    uid: string,
    taskId: string,
    dateKey: string
): Promise<TaskLog | null> => {
    const logsRef = collection(db, "users", uid, "taskLogs");
    const q = query(logsRef, where("taskId", "==", taskId));

    const snapshot = await getDocs(q);
    for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const logDate = (data.doneAt as Timestamp).toDate();
        const logKey = logDate.toISOString().split("T")[0];

        if (logKey === dateKey) {
            return {
                id: docSnap.id,
                taskId: data.taskId,
                taskName: data.taskName,
                measure: data.measure,
                userId: uid,
                doneAt: logDate,
                value: data.value,
            };
        }
    }

    return null;
};

// Buscar todos os logs
export async function getAllTaskLogs(uid: string): Promise<TaskLog[]> {
    const logsRef = collection(db, "users", uid, "taskLogs");
    const snap = await getDocs(logsRef);

    return snap.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            taskId: data.taskId,
            taskName: data.taskName,
            measure: data.measure,
            userId: uid,
            doneAt: (data.doneAt as Timestamp).toDate(),
            value: data.value,
        } as TaskLog;
    });
}

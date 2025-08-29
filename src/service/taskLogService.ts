// src/service/taskLogService.ts
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

export interface TaskLog {
    id?: string;
    taskId: string;
    doneAt: Date; // no código a gente converte para Firestore Timestamp
    value: number;
}

// Adicionar um log
export const addTaskLog = async (uid: string, log: TaskLog) => {
    const logsRef = collection(db, "users", uid, "taskLogs");
    const docRef = await addDoc(logsRef, {
        taskId: log.taskId,
        doneAt: Timestamp.fromDate(log.doneAt),
        value: log.value,
    });
    return docRef.id;
};

// Deletar um log
export const deleteTaskLog = async (uid: string, logId: string) => {
    const logRef = doc(db, "users", uid, "taskLogs", logId);
    await deleteDoc(logRef);
};

// Buscar log por taskId e data (yyyy-mm-dd)
export const getTaskLogByDate = async (
    uid: string,
    taskId: string,
    dateKey: string // formato yyyy-mm-dd
): Promise<TaskLog | null> => {
    const logsRef = collection(db, "users", uid, "taskLogs");
    const q = query(
        logsRef,
        where("taskId", "==", taskId)
    );

    const snapshot = await getDocs(q);
    for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const logDate = (data.doneAt as Timestamp).toDate();
        const logKey = logDate.toISOString().split("T")[0]; // yyyy-mm-dd

        if (logKey === dateKey) {
            return {
                id: docSnap.id,
                taskId: data.taskId,
                doneAt: logDate,
                value: data.value,
            };
        }
    }

    return null;
};

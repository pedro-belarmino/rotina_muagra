import {
    collection,
    getDocs,
    query,
    where,
    Timestamp,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../firebase/config";
import { formatISODate, getNowInBrasilia } from "../utils/period";
import type { TaskLog } from "../types/TaskLog";

export const addTaskLog = async (
    _uid: string,
    log: TaskLog,
    taskName: string,
    measure: string
): Promise<string> => {
    const createLogFn = httpsCallable<any, { id: string }>(functions, "createTaskLog");
    const response = await createLogFn({
        taskId: log.taskId,
        taskName: taskName || log.taskName,
        measure: measure || log.measure,
        value: log.value,
        doneAt: log.doneAt ? new Date(log.doneAt).toISOString() : undefined,
    });
    return response.data.id;
};

export const deleteTaskLog = async (_uid: string, logId: string): Promise<void> => {
    const deleteLogFn = httpsCallable<any, { success: boolean }>(functions, "deleteTaskLog");
    await deleteLogFn({ logId });
};

export const getTaskLogsByDay = async (
    uid: string,
    dateKey: string
): Promise<TaskLog[]> => {
    const logsRef = collection(db, "users", uid, "taskLogs");
    const q = query(logsRef, where("day", "==", dateKey));
    const snap = await getDocs(q);
    return snap.docs.map(docSnap => {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            taskId: data.taskId,
            taskName: data.taskName,
            measure: data.measure,
            userId: uid,
            doneAt: (data.doneAt as Timestamp).toDate(),
            value: data.value,
            day: data.day,
        } as TaskLog;
    });
};

export const getTaskLogByDate = async (
    uid: string,
    taskId: string,
    dateKey: string
): Promise<TaskLog | null> => {
    const logsRef = collection(db, "users", uid, "taskLogs");

    const q = query(logsRef, where("taskId", "==", taskId), where("day", "==", dateKey));
    const snap = await getDocs(q);
    if (!snap.empty) {
        const docSnap = snap.docs[0];
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
    }

    const qAll = query(logsRef, where("taskId", "==", taskId));
    const snapshot = await getDocs(qAll);
    for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const logDate = (data.doneAt as Timestamp).toDate();
        const yyyy = logDate.getFullYear();
        const mm = String(logDate.getMonth() + 1).padStart(2, '0');
        const dd = String(logDate.getDate()).padStart(2, '0');
        const logKey = `${yyyy}-${mm}-${dd}`;

        if (logKey === dateKey) {
            return {
                id: docSnap.id,
                taskId: data.taskId,
                taskName: data.taskName,
                measure: data.measure,
                userId: uid,
                doneAt: logDate,
                value: data.value,
            } as TaskLog;
        }
    }

    return null;
};

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

export const getTaskLogsByMonth = async (uid: string, taskId: string, date: Date): Promise<number> => {
    const logsRef = collection(db, "users", uid, "taskLogs");
    const year = date.getFullYear();
    const month = date.getMonth();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const q = query(
        logsRef,
        where("taskId", "==", taskId),
        where("doneAt", ">=", Timestamp.fromDate(startDate)),
        where("doneAt", "<=", Timestamp.fromDate(endDate))
    );

    const snap = await getDocs(q);
    return snap.docs.reduce((total, doc) => total + doc.data().value, 0);
};

export const getTaskLogsByYear = async (uid: string, taskId: string, date: Date): Promise<number> => {
    const logsRef = collection(db, "users", uid, "taskLogs");
    const year = date.getFullYear();
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const q = query(
        logsRef,
        where("taskId", "==", taskId),
        where("doneAt", ">=", Timestamp.fromDate(startDate)),
        where("doneAt", "<=", Timestamp.fromDate(endDate))
    );

    const snap = await getDocs(q);
    return snap.docs.reduce((total, doc) => total + doc.data().value, 0);
};

export const getTaskLogDaysByMonth = async (uid: string, taskId: string, date: Date): Promise<number> => {
    const logsRef = collection(db, "users", uid, "taskLogs");
    const year = date.getFullYear();
    const month = date.getMonth();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const q = query(
        logsRef,
        where("taskId", "==", taskId),
        where("doneAt", ">=", Timestamp.fromDate(startDate)),
        where("doneAt", "<=", Timestamp.fromDate(endDate))
    );

    const snap = await getDocs(q);
    const uniqueDays = new Set(snap.docs.map(doc => doc.data().day));
    return uniqueDays.size;
};

export const getTaskStreak = async (uid: string, taskId: string): Promise<number> => {
    const logsRef = collection(db, "users", uid, "taskLogs");
    const q = query(logsRef, where("taskId", "==", taskId));
    const snap = await getDocs(q);

    if (snap.empty) {
        return 0;
    }

    const logDays = new Set(snap.docs.map(doc => doc.data().day as string));

    let streak = 0;
    let currentDate = getNowInBrasilia();
    const todayKey = formatISODate(currentDate);

    if (!logDays.has(todayKey)) {
        currentDate.setUTCDate(currentDate.getUTCDate() - 1);
    }

    while (true) {
        const dayKey = formatISODate(currentDate);
        if (logDays.has(dayKey)) {
            streak++;
            currentDate.setUTCDate(currentDate.getUTCDate() - 1);
        } else {
            break;
        }
    }

    return streak;
};

export const getTaskLogsByPeriod = async (
    uid: string,
    startDate: Date,
    endDate: Date,
    taskIds: string[]
): Promise<TaskLog[]> => {
    if (taskIds.length === 0) {
        return [];
    }

    const logsRef = collection(db, "users", uid, "taskLogs");
    const allLogs: TaskLog[] = [];
    const chunks: string[][] = [];

    for (let i = 0; i < taskIds.length; i += 30) {
        chunks.push(taskIds.slice(i, i + 30));
    }

    for (const chunk of chunks) {
        const q = query(
            logsRef,
            where("taskId", "in", chunk),
            where("doneAt", ">=", Timestamp.fromDate(startDate)),
            where("doneAt", "<=", Timestamp.fromDate(endDate))
        );
        const snap = await getDocs(q);
        const logs = snap.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                taskId: data.taskId,
                taskName: data.taskName,
                measure: data.measure,
                userId: uid,
                doneAt: (data.doneAt as Timestamp).toDate(),
                value: data.value,
            } as TaskLog;
        });
        allLogs.push(...logs);
    }

    return allLogs;
};

export const getTaskLogDaysByYear = async (uid: string, taskId: string, date: Date): Promise<number> => {
    const logsRef = collection(db, "users", uid, "taskLogs");
    const year = date.getFullYear();
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const q = query(
        logsRef,
        where("taskId", "==", taskId),
        where("doneAt", ">=", Timestamp.fromDate(startDate)),
        where("doneAt", "<=", Timestamp.fromDate(endDate))
    );

    const snap = await getDocs(q);
    const uniqueDays = new Set(snap.docs.map(doc => doc.data().day));
    return uniqueDays.size;
};

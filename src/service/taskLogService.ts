import {
    collection,
    addDoc,
    deleteDoc,
    getDocs,
    query,
    where,
    Timestamp,
    doc,
    DocumentReference,
    getDoc,
    increment,
    runTransaction,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { formatISODate, getNowInBrasilia, getPeriodStartForType } from "../utils/period";
import type { TaskLog } from "../types/TaskLog";
import type { Task } from "../types/Task";


export const addTaskLog = async (
    uid: string,
    log: TaskLog,
    taskName: string,
    measure: string
) => {
    const logsRef = collection(db, "users", uid, "taskLogs");


    const doneDate = new Date(log.doneAt);
    const dayKey = formatISODate(doneDate);


    const existing = await getTaskLogByDate(uid, log.taskId, dayKey);

    if (existing) {

        const docRef = await addDoc(logsRef, {
            taskId: log.taskId,
            taskName,
            measure,
            doneAt: Timestamp.fromDate(doneDate),
            value: log.value,
            userId: uid,
            day: dayKey,
        });
        return docRef.id;
    }





    const taskRef = doc(db, "users", uid, "tasks", log.taskId);
    const taskDayMarkRef = doc(db, "users", uid, "tasks", log.taskId, "dayMarks", dayKey);

    const newLogRef = doc(collection(db, "users", uid, "taskLogs"));

    await runTransaction(db, async (transaction) => {

        const dayMarkSnap = await transaction.get(taskDayMarkRef);
        if (dayMarkSnap.exists()) {


            transaction.set(newLogRef, {
                taskId: log.taskId,
                taskName,
                measure,
                doneAt: Timestamp.fromDate(doneDate),
                value: log.value,
                userId: uid,
                day: dayKey,
            });
            return;
        }


        const taskSnap = await transaction.get(taskRef);
        if (!taskSnap.exists()) {

            transaction.set(newLogRef, {
                taskId: log.taskId,
                taskName,
                measure,
                doneAt: Timestamp.fromDate(doneDate),
                value: log.value,
                userId: uid,
                day: dayKey,
            });
            return;
        }

        const taskData = taskSnap.data() as Partial<Task>;
        const totalGoalType = (taskData.totalGoalType as any) ?? null;

        transaction.set(taskDayMarkRef, {
            createdAt: Timestamp.fromDate(doneDate),
        });


        transaction.set(newLogRef, {
            taskId: log.taskId,
            taskName,
            measure,
            doneAt: Timestamp.fromDate(doneDate),
            value: log.value,
            userId: uid,
            day: dayKey,
        });




        const currentPeriodStart = getPeriodStartForType(doneDate, totalGoalType as any);

        if (!currentPeriodStart) {

            return;
        }

        const taskPeriodStart = taskData.periodStart ?? null;


        if (taskPeriodStart !== currentPeriodStart) {

            transaction.update(taskRef, { days: 1, periodStart: currentPeriodStart });
        } else {

            transaction.update(taskRef, { days: increment(1) });
        }
    });

    return newLogRef.id;
};





export const deleteTaskLog = async (uid: string, logId: string) => {

    const logRef = doc(db, "users", uid, "taskLogs", logId);
    const logSnap = await getDocOrNull(logRef);
    if (!logSnap) return;

    const logData = logSnap.data();
    const taskId = logData.taskId as string;
    const dayKey = (logData.day as string) ?? formatISODate((logData.doneAt as Timestamp).toDate());


    await deleteDoc(logRef);


    const logsRef = collection(db, "users", uid, "taskLogs");
    const q = query(logsRef, where("taskId", "==", taskId), where("day", "==", dayKey));
    const remainingLogs = await getDocs(q);

    if (!remainingLogs.empty) {

        return;
    }


    const taskRef = doc(db, "users", uid, "tasks", taskId);
    const dayMarkRef = doc(db, "users", uid, "tasks", taskId, "dayMarks", dayKey);

    await runTransaction(db, async (transaction) => {
        const taskSnap = await transaction.get(taskRef);
        if (!taskSnap.exists()) {

            const dmSnap = await transaction.get(dayMarkRef);
            if (dmSnap.exists()) transaction.delete(dayMarkRef);
            return;
        }

        const taskData = taskSnap.data() as Partial<Task>;
        const totalGoalType = (taskData.totalGoalType as any) ?? null;


        const now = getNowInBrasilia();
        const currentPeriodStart = getPeriodStartForType(now, totalGoalType as any);

        if (!currentPeriodStart) {

            const dmSnap = await transaction.get(dayMarkRef);
            if (dmSnap.exists()) transaction.delete(dayMarkRef);
            return;
        }

        const taskPeriodStart = taskData.periodStart ?? null;


        const dmSnap = await transaction.get(dayMarkRef);
        if (dmSnap.exists()) transaction.delete(dayMarkRef);

        if (taskPeriodStart !== currentPeriodStart) {

            transaction.update(taskRef, { days: 0, periodStart: currentPeriodStart });
        } else {

            const curDays = (taskData.days ?? 0) as number;
            const newDays = Math.max(0, curDays - 1);
            transaction.update(taskRef, { days: newDays });
        }
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



        // const logDate = (data.doneAt as Timestamp).toDate();
        // const logKey = logDate.toISOString().split("T")[0];

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

async function getDocOrNull(ref: DocumentReference) {
    try {
        const snap = await getDoc(ref);
        if (!snap.exists()) return null;
        return snap;
    } catch (e) {
        console.error("getDoc failed:", e);
        return null;
    }
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

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db, requireAuth } from "../utils/auth";
import { formatISODate, getNowInBrasilia, getPeriodStartForType } from "../utils/timezone";
import type { CreateTaskLogInput, DeleteTaskLogInput, Task } from "../types";
import * as admin from "firebase-admin";

export const createTaskLog = onCall({ maxInstances: 10 }, async (request) => {
    const { uid } = requireAuth(request);
    const data = request.data as CreateTaskLogInput;

    if (!data.taskId || typeof data.taskId !== "string") {
        throw new HttpsError("invalid-argument", "ID da tarefa não fornecido.");
    }

    const taskRef = db.collection("users").doc(uid).collection("tasks").doc(data.taskId);
    const taskSnap = await taskRef.get();

    if (!taskSnap.exists) {
        throw new HttpsError("not-found", "Tarefa não encontrada.");
    }

    const taskData = taskSnap.data() as Task;
    const taskName = data.taskName || taskData.name || "";
    const measure = data.measure || taskData.measure || "";
    const logValue = typeof data.value === "number" ? data.value : 1;

    let doneDate: Date;
    if (data.doneAt) {
        doneDate = new Date(data.doneAt);
    } else {
        doneDate = getNowInBrasilia();
    }

    const dayKey = formatISODate(doneDate);
    const logsRef = db.collection("users").doc(uid).collection("taskLogs");

    const existingSnap = await logsRef
        .where("taskId", "==", data.taskId)
        .where("day", "==", dayKey)
        .get();

    if (!existingSnap.empty) {
        const docRef = await logsRef.add({
            taskId: data.taskId,
            taskName,
            measure,
            doneAt: admin.firestore.Timestamp.fromDate(doneDate),
            value: logValue,
            userId: uid,
            day: dayKey,
        });
        return { id: docRef.id };
    }

    const taskDayMarkRef = db.collection("users").doc(uid).collection("tasks").doc(data.taskId).collection("dayMarks").doc(dayKey);
    const newLogRef = logsRef.doc();

    await db.runTransaction(async (transaction) => {
        const dayMarkSnap = await transaction.get(taskDayMarkRef);
        if (dayMarkSnap.exists) {
            transaction.set(newLogRef, {
                taskId: data.taskId,
                taskName,
                measure,
                doneAt: admin.firestore.Timestamp.fromDate(doneDate),
                value: logValue,
                userId: uid,
                day: dayKey,
            });
            return;
        }

        const tSnap = await transaction.get(taskRef);
        if (!tSnap.exists) {
            transaction.set(newLogRef, {
                taskId: data.taskId,
                taskName,
                measure,
                doneAt: admin.firestore.Timestamp.fromDate(doneDate),
                value: logValue,
                userId: uid,
                day: dayKey,
            });
            return;
        }

        const currentTaskData = tSnap.data() as Task;
        const totalGoalType = currentTaskData.totalGoalType || null;

        transaction.set(taskDayMarkRef, {
            createdAt: admin.firestore.Timestamp.fromDate(doneDate),
        });

        transaction.set(newLogRef, {
            taskId: data.taskId,
            taskName,
            measure,
            doneAt: admin.firestore.Timestamp.fromDate(doneDate),
            value: logValue,
            userId: uid,
            day: dayKey,
        });

        const currentPeriodStart = getPeriodStartForType(doneDate, totalGoalType || undefined);
        if (!currentPeriodStart) {
            return;
        }

        const taskPeriodStart = currentTaskData.periodStart ?? null;
        if (taskPeriodStart !== currentPeriodStart) {
            transaction.update(taskRef, { days: 1, periodStart: currentPeriodStart });
        } else {
            transaction.update(taskRef, { days: admin.firestore.FieldValue.increment(1) });
        }
    });

    return { id: newLogRef.id };
});

export const deleteTaskLog = onCall({ maxInstances: 10 }, async (request) => {
    const { uid } = requireAuth(request);
    const data = request.data as DeleteTaskLogInput;

    if (!data || !data.logId || typeof data.logId !== "string") {
        throw new HttpsError("invalid-argument", "ID do log não fornecido.");
    }

    const logRef = db.collection("users").doc(uid).collection("taskLogs").doc(data.logId);
    const logSnap = await logRef.get();

    if (!logSnap.exists) {
        return { success: true };
    }

    const logData = logSnap.data()!;
    const taskId = logData.taskId as string;
    const dayKey = (logData.day as string) || formatISODate((logData.doneAt as admin.firestore.Timestamp).toDate());

    await logRef.delete();

    const remainingSnap = await db.collection("users").doc(uid).collection("taskLogs")
        .where("taskId", "==", taskId)
        .where("day", "==", dayKey)
        .get();

    if (!remainingSnap.empty) {
        return { success: true };
    }

    const taskRef = db.collection("users").doc(uid).collection("tasks").doc(taskId);
    const dayMarkRef = db.collection("users").doc(uid).collection("tasks").doc(taskId).collection("dayMarks").doc(dayKey);

    await db.runTransaction(async (transaction) => {
        const taskSnap = await transaction.get(taskRef);
        if (!taskSnap.exists) {
            const dmSnap = await transaction.get(dayMarkRef);
            if (dmSnap.exists) transaction.delete(dayMarkRef);
            return;
        }

        const taskData = taskSnap.data() as Task;
        const totalGoalType = taskData.totalGoalType || null;
        const now = getNowInBrasilia();
        const currentPeriodStart = getPeriodStartForType(now, totalGoalType || undefined);

        const dmSnap = await transaction.get(dayMarkRef);
        if (dmSnap.exists) transaction.delete(dayMarkRef);

        if (!currentPeriodStart) {
            return;
        }

        const taskPeriodStart = taskData.periodStart ?? null;
        if (taskPeriodStart !== currentPeriodStart) {
            transaction.update(taskRef, { days: 0, periodStart: currentPeriodStart });
        } else {
            const curDays = taskData.days ?? 0;
            const newDays = Math.max(0, curDays - 1);
            transaction.update(taskRef, { days: newDays });
        }
    });

    return { success: true };
});

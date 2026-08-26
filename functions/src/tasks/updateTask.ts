import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db, requireAuth } from "../utils/auth";
import { getNowInBrasilia, getPeriodStartForType } from "../utils/timezone";
import type { UpdateTaskInput, Task } from "../types";
import * as admin from "firebase-admin";

export const updateTask = onCall({ maxInstances: 10 }, async (request) => {
    const { uid } = requireAuth(request);
    const data = request.data as UpdateTaskInput;

    if (!data || !data.taskId || typeof data.taskId !== "string") {
        throw new HttpsError("invalid-argument", "ID da tarefa não fornecido.");
    }

    if (!data.updates || typeof data.updates !== "object") {
        throw new HttpsError("invalid-argument", "Atualizações não fornecidas.");
    }

    const taskRef = db.collection("users").doc(uid).collection("tasks").doc(data.taskId);
    const taskSnap = await taskRef.get();

    if (!taskSnap.exists) {
        throw new HttpsError("not-found", "Tarefa não encontrada.");
    }

    const allowedFields = [
        "name", "description", "measure", "dailyGoal", "totalGoal",
        "totalGoalType", "schedule", "dailyTask", "archived",
        "periodStart", "days", "daysYear", "yearStart", "totalMonth", "totalYear",
        "priority", "taskType", "gratitudeTrack", "icon"
    ];

    const updatesToApply: Record<string, any> = {};

    for (const key of allowedFields) {
        if (key in data.updates) {
            updatesToApply[key] = (data.updates as any)[key];
        }
    }

    if (typeof updatesToApply.name === "string") {
        updatesToApply.name = updatesToApply.name.trim().slice(0, 30);
    }

    if ("priority" in data.updates) {
        if (data.updates.priority) {
            updatesToApply.priority = admin.firestore.Timestamp.now();
        } else {
            updatesToApply.priority = null;
        }
    }

    await taskRef.update(updatesToApply);
    return { success: true };
});

export const deleteTask = onCall({ maxInstances: 10 }, async (request) => {
    const { uid } = requireAuth(request);
    const { taskId } = request.data as { taskId: string };

    if (!taskId || typeof taskId !== "string") {
        throw new HttpsError("invalid-argument", "ID da tarefa não fornecido.");
    }

    const taskRef = db.collection("users").doc(uid).collection("tasks").doc(taskId);
    const taskSnap = await taskRef.get();

    if (!taskSnap.exists) {
        throw new HttpsError("not-found", "Tarefa não encontrada.");
    }

    await taskRef.delete();

    const logsSnap = await db.collection("users").doc(uid).collection("taskLogs")
        .where("taskId", "==", taskId)
        .get();

    if (!logsSnap.empty) {
        const batch = db.batch();
        logsSnap.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
    }

    return { success: true };
});

export const ensureTaskPeriods = onCall({ maxInstances: 10 }, async (request) => {
    const { uid } = requireAuth(request);
    const now = getNowInBrasilia();
    const currentYear = String(now.getFullYear());

    const tasksSnap = await db.collection("users").doc(uid).collection("tasks").get();
    const batch = db.batch();
    let updatedCount = 0;

    for (const doc of tasksSnap.docs) {
        const task = doc.data() as Task;
        const currentPeriodStart = getPeriodStartForType(now, task.totalGoalType);
        const updates: Record<string, any> = {};

        if (!currentPeriodStart) {
            if (task.periodStart) {
                updates.periodStart = null;
                updates.days = task.days ?? 0;
                updates.totalMonth = 0;
            }
        } else if (task.periodStart !== currentPeriodStart) {
            updates.days = 0;
            updates.periodStart = currentPeriodStart;
        }

        if (task.yearStart !== currentYear) {
            updates.daysYear = 0;
            updates.yearStart = currentYear;
            updates.totalYear = 0;
        }

        if (Object.keys(updates).length > 0) {
            batch.update(doc.ref, updates);
            updatedCount++;
        }
    }

    if (updatedCount > 0) {
        await batch.commit();
    }

    return { updatedCount };
});

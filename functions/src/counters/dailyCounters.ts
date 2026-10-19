import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db, requireAuth } from "../utils/auth";
import { getTodayKey, getNowInBrasilia, formatISODate } from "../utils/timezone";
import * as admin from "firebase-admin";

export const incrementDailyCounter = onCall({ maxInstances: 10 }, async (request) => {
    const { uid } = requireAuth(request);
    const todayKey = getTodayKey();

    const userCounterRef = db.collection("users").doc(uid).collection("dailyCounters").doc(todayKey);
    const globalCounterRef = db.collection("GlobalCounter").doc("global_counter");
    const tasksRef = db.collection("users").doc(uid).collection("tasks");

    let newValue = 1;

    await db.runTransaction(async (transaction) => {
        const userCounterSnap = await transaction.get(userCounterRef);
        const globalCounterSnap = await transaction.get(globalCounterRef);

        if (!userCounterSnap.exists) {
            transaction.set(userCounterRef, {
                value: 1,
                dateKey: todayKey,
                updatedAt: admin.firestore.Timestamp.now(),
                comment: "",
            });
            newValue = 1;
        } else {
            const data = userCounterSnap.data() as { value: number };
            newValue = data.value + 1;
            transaction.update(userCounterRef, {
                value: admin.firestore.FieldValue.increment(1),
                updatedAt: admin.firestore.Timestamp.now(),
            });
        }

        if (!globalCounterSnap.exists) {
            transaction.set(globalCounterRef, { value: 1 });
        } else {
            transaction.update(globalCounterRef, { value: admin.firestore.FieldValue.increment(1) });
        }
    });

    const tasksSnap = await tasksRef.get();
    const gratitudeTasks = tasksSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as any))
        .filter(t => t.taskType === 'gratitude');

    if (gratitudeTasks.length > 0) {
        const activeTask = [...gratitudeTasks].sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
            return dateB.getTime() - dateA.getTime();
        })[0];

        if (activeTask && activeTask.id) {
            const now = getNowInBrasilia();
            const dayKey = formatISODate(now);
            const logsRef = db.collection("users").doc(uid).collection("taskLogs");

            await logsRef.add({
                taskId: activeTask.id,
                taskName: activeTask.name || "",
                measure: activeTask.measure || "",
                doneAt: admin.firestore.Timestamp.fromDate(now),
                value: 1,
                userId: uid,
                day: dayKey,
            });
        }
    }

    return { value: newValue };
});

export const updateDailyComment = onCall({ maxInstances: 10 }, async (request) => {
    const { uid } = requireAuth(request);
    const { comment } = request.data as { comment: string };

    if (typeof comment !== "string") {
        throw new HttpsError("invalid-argument", "Comentário inválido.");
    }

    const todayKey = getTodayKey();
    const counterRef = db.collection("users").doc(uid).collection("dailyCounters").doc(todayKey);
    const snap = await counterRef.get();

    if (!snap.exists) {
        await counterRef.set({
            value: 0,
            dateKey: todayKey,
            updatedAt: admin.firestore.Timestamp.now(),
            comment: comment,
        });
    } else {
        await counterRef.update({
            comment: comment,
            updatedAt: admin.firestore.Timestamp.now(),
        });
    }

    return { success: true };
});

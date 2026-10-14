import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore";
import { assertOwnUid } from "../shared/auth";
import { formatISODate, getPeriodStartForType } from "../shared/period";

export const addTaskLog = onCall(async (request) => {
  const { userId, log, taskName, measure } = request.data ?? {};
  assertOwnUid(request, userId);

  if (!log || typeof log.taskId !== "string" || typeof log.value !== "number") {
    throw new HttpsError("invalid-argument", "log inválido.");
  }

  const db = getFirestore();
  const userRef = db.collection("users").doc(userId);
  const logsRef = userRef.collection("taskLogs");

  const doneDate = new Date(log.doneAt);
  const dayKey = formatISODate(doneDate);

  const existing = await logsRef
    .where("taskId", "==", log.taskId)
    .where("day", "==", dayKey)
    .limit(1)
    .get();

  const logPayload = {
    taskId: log.taskId,
    taskName,
    measure,
    doneAt: Timestamp.fromDate(doneDate),
    value: log.value,
    userId,
    day: dayKey,
  };

  if (!existing.empty) {
    const docRef = await logsRef.add(logPayload);
    return { id: docRef.id };
  }

  const taskRef = userRef.collection("tasks").doc(log.taskId);
  const taskDayMarkRef = taskRef.collection("dayMarks").doc(dayKey);
  const newLogRef = logsRef.doc();

  await db.runTransaction(async (transaction) => {
    const dayMarkSnap = await transaction.get(taskDayMarkRef);
    if (dayMarkSnap.exists) {
      transaction.set(newLogRef, logPayload);
      return;
    }

    const taskSnap = await transaction.get(taskRef);
    if (!taskSnap.exists) {
      transaction.set(newLogRef, logPayload);
      return;
    }

    const taskData = taskSnap.data() as Record<string, unknown>;
    const totalGoalType = (taskData.totalGoalType as string) ?? null;

    transaction.set(taskDayMarkRef, { createdAt: Timestamp.fromDate(doneDate) });
    transaction.set(newLogRef, logPayload);

    const currentPeriodStart = getPeriodStartForType(
      doneDate,
      totalGoalType as "monthly" | "weekly" | "general" | "" | undefined
    );
    if (!currentPeriodStart) return;

    const taskPeriodStart = taskData.periodStart ?? null;
    if (taskPeriodStart !== currentPeriodStart) {
      transaction.update(taskRef, { days: 1, periodStart: currentPeriodStart });
    } else {
      transaction.update(taskRef, { days: FieldValue.increment(1) });
    }
  });

  return { id: newLogRef.id };
});

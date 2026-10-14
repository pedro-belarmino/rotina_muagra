import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { assertOwnUid } from "../shared/auth";
import { formatISODate, getNowInBrasilia, getPeriodStartForType } from "../shared/period";

export const deleteTaskLog = onCall(async (request) => {
  const { userId, logId } = request.data ?? {};
  assertOwnUid(request, userId);

  if (typeof logId !== "string" || !logId) {
    throw new HttpsError("invalid-argument", "logId inválido.");
  }

  const db = getFirestore();
  const userRef = db.collection("users").doc(userId);
  const logRef = userRef.collection("taskLogs").doc(logId);
  const logSnap = await logRef.get();
  if (!logSnap.exists) return;

  const logData = logSnap.data() as Record<string, unknown>;
  const taskId = logData.taskId as string;
  const dayKey = (logData.day as string) ?? formatISODate((logData.doneAt as Timestamp).toDate());

  await logRef.delete();

  const logsRef = userRef.collection("taskLogs");
  const remainingLogs = await logsRef
    .where("taskId", "==", taskId)
    .where("day", "==", dayKey)
    .get();

  if (!remainingLogs.empty) return;

  const taskRef = userRef.collection("tasks").doc(taskId);
  const dayMarkRef = taskRef.collection("dayMarks").doc(dayKey);

  await db.runTransaction(async (transaction) => {
    const taskSnap = await transaction.get(taskRef);
    if (!taskSnap.exists) {
      const dmSnap = await transaction.get(dayMarkRef);
      if (dmSnap.exists) transaction.delete(dayMarkRef);
      return;
    }

    const taskData = taskSnap.data() as Record<string, unknown>;
    const totalGoalType = (taskData.totalGoalType as string) ?? null;

    const now = getNowInBrasilia();
    const currentPeriodStart = getPeriodStartForType(
      now,
      totalGoalType as "monthly" | "weekly" | "general" | "" | undefined
    );

    if (!currentPeriodStart) {
      const dmSnap = await transaction.get(dayMarkRef);
      if (dmSnap.exists) transaction.delete(dayMarkRef);
      return;
    }

    const taskPeriodStart = taskData.periodStart ?? null;

    const dmSnap = await transaction.get(dayMarkRef);
    if (dmSnap.exists) transaction.delete(dayMarkRef);

    if (taskPeriodStart !== currentPeriodStart) {
      transaction.update(taskRef, { days: 0, periodStart: currentPeriodStart });
    } else {
      const curDays = (taskData.days as number) ?? 0;
      const newDays = Math.max(0, curDays - 1);
      transaction.update(taskRef, { days: newDays });
    }
  });
});

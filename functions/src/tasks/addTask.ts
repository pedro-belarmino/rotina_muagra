import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { assertOwnUid } from "../shared/auth";
import { getNowInBrasilia, getPeriodStartForType } from "../shared/period";

export const addTask = onCall(async (request) => {
  const { userId, task } = request.data ?? {};
  assertOwnUid(request, userId);

  if (!task || typeof task.name !== "string") {
    throw new HttpsError("invalid-argument", "task inválida.");
  }

  const db = getFirestore();
  const tasksRef = db.collection("users").doc(userId).collection("tasks");
  const now = getNowInBrasilia();
  const periodStart = getPeriodStartForType(now, task.totalGoalType);

  await tasksRef.add({
    ...task,
    createdAt: new Date(),
    archived: false,
    days: 0,
    periodStart: periodStart ?? null,
    daysYear: 0,
    yearStart: String(now.getFullYear()),
    totalMonth: 0,
    totalYear: 0,
  });
});

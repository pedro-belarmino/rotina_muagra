import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { assertOwnUid } from "../shared/auth";
import { getNowInBrasilia, getPeriodStartForType } from "../shared/period";

export const ensureTasksAreCurrent = onCall(async (request) => {
  const { userId, taskIds } = request.data ?? {};
  assertOwnUid(request, userId);

  if (!Array.isArray(taskIds) || taskIds.some((id) => typeof id !== "string")) {
    throw new HttpsError("invalid-argument", "taskIds inválido.");
  }
  if (taskIds.length === 0) return;

  const db = getFirestore();
  const tasksRef = db.collection("users").doc(userId).collection("tasks");
  const now = getNowInBrasilia();
  const currentYear = String(now.getFullYear());

  const snapshots = await db.getAll(...taskIds.map((id: string) => tasksRef.doc(id)));
  const batch = db.batch();

  for (const snap of snapshots) {
    if (!snap.exists) continue;
    const task = snap.data() as Record<string, unknown>;
    const updates: Record<string, unknown> = {};

    const currentPeriodStart = getPeriodStartForType(
      now,
      task.totalGoalType as "monthly" | "weekly" | "general" | "" | undefined
    );
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
      batch.update(snap.ref, updates);
    }
  }

  await batch.commit();
});

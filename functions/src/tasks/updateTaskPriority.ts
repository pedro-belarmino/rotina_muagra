import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { assertOwnUid } from "../shared/auth";

export const updateTaskPriority = onCall(async (request) => {
  const { userId, taskId, isPriority } = request.data ?? {};
  assertOwnUid(request, userId);

  if (typeof taskId !== "string" || !taskId) {
    throw new HttpsError("invalid-argument", "taskId inválido.");
  }
  if (typeof isPriority !== "boolean") {
    throw new HttpsError("invalid-argument", "isPriority inválido.");
  }

  const db = getFirestore();
  const taskRef = db.collection("users").doc(userId).collection("tasks").doc(taskId);
  const priorityValue = isPriority ? Timestamp.now() : null;
  await taskRef.update({ priority: priorityValue });
});

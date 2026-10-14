import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { assertOwnUid } from "../shared/auth";

export const updateTask = onCall(async (request) => {
  const { userId, taskId, updates } = request.data ?? {};
  assertOwnUid(request, userId);

  if (typeof taskId !== "string" || !taskId) {
    throw new HttpsError("invalid-argument", "taskId inválido.");
  }
  if (!updates || typeof updates !== "object") {
    throw new HttpsError("invalid-argument", "updates inválido.");
  }

  const db = getFirestore();
  const taskRef = db.collection("users").doc(userId).collection("tasks").doc(taskId);
  await taskRef.update(updates);
});

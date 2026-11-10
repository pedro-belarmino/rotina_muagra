import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { assertOwnUid } from "../shared/auth";

export const archiveTask = onCall(async (request) => {
  const { userId, taskId } = request.data ?? {};
  assertOwnUid(request, userId);

  if (typeof taskId !== "string" || !taskId) {
    throw new HttpsError("invalid-argument", "taskId inválido.");
  }

  const db = getFirestore();
  const taskRef = db.collection("users").doc(userId).collection("tasks").doc(taskId);
  await taskRef.update({ archived: true });
});

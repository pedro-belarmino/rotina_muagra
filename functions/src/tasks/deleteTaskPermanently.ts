import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { assertOwnUid } from "../shared/auth";

export const deleteTaskPermanently = onCall(async (request) => {
  const { userId, taskId } = request.data ?? {};
  assertOwnUid(request, userId);

  if (typeof taskId !== "string" || !taskId) {
    throw new HttpsError("invalid-argument", "taskId inválido.");
  }

  const db = getFirestore();
  const userRef = db.collection("users").doc(userId);

  await userRef.collection("tasks").doc(taskId).delete();

  const logsRef = userRef.collection("taskLogs");
  const snapshot = await logsRef.where("taskId", "==", taskId).get();

  await Promise.all(snapshot.docs.map((logDoc) => logDoc.ref.delete()));
});

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { assertOwnUid } from "../shared/auth";
import { formatISODate, getNowInBrasilia } from "../shared/period";

export const updateDailyComment = onCall(async (request) => {
  const { userId, comment } = request.data ?? {};
  assertOwnUid(request, userId);

  if (typeof comment !== "string") {
    throw new HttpsError("invalid-argument", "comment inválido.");
  }

  const todayKey = formatISODate(getNowInBrasilia());
  const db = getFirestore();
  const counterRef = db
    .collection("users")
    .doc(userId)
    .collection("dailyCounters")
    .doc(todayKey);
  const snap = await counterRef.get();

  if (!snap.exists) {
    await counterRef.set({
      value: 0,
      dateKey: todayKey,
      updatedAt: Timestamp.now(),
      comment,
    });
  } else {
    await counterRef.update({
      comment,
      updatedAt: Timestamp.now(),
    });
  }
});

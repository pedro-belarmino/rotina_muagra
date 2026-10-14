import { onCall } from "firebase-functions/v2/https";
import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore";
import { assertOwnUid } from "../shared/auth";
import { formatISODate, getNowInBrasilia } from "../shared/period";

export const incrementDailyCounter = onCall(async (request) => {
  const { userId } = request.data ?? {};
  assertOwnUid(request, userId);

  const todayKey = formatISODate(getNowInBrasilia());
  const db = getFirestore();
  const userCounterRef = db
    .collection("users")
    .doc(userId)
    .collection("dailyCounters")
    .doc(todayKey);
  const globalCounterRef = db.collection("GlobalCounter").doc("global_counter");

  return await db.runTransaction(async (transaction) => {
    const userCounterSnap = await transaction.get(userCounterRef);
    const globalCounterSnap = await transaction.get(globalCounterRef);

    if (!userCounterSnap.exists) {
      transaction.set(userCounterRef, {
        value: 1,
        dateKey: todayKey,
        updatedAt: Timestamp.now(),
        comment: "",
      });

      if (!globalCounterSnap.exists) {
        transaction.set(globalCounterRef, { value: 1 });
      } else {
        transaction.update(globalCounterRef, { value: FieldValue.increment(1) });
      }
      return 1;
    }

    const data = userCounterSnap.data() as { value: number };
    transaction.update(userCounterRef, {
      value: FieldValue.increment(1),
      updatedAt: Timestamp.now(),
    });

    if (!globalCounterSnap.exists) {
      transaction.set(globalCounterRef, { value: 1 });
    } else {
      transaction.update(globalCounterRef, { value: FieldValue.increment(1) });
    }

    return data.value + 1;
  });
});

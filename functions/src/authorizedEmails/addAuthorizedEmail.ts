import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { assertAdmin } from "../shared/auth";

export const addAuthorizedEmail = onCall(async (request) => {
  assertAdmin(request);

  const { email } = request.data ?? {};
  if (typeof email !== "string" || !email) {
    throw new HttpsError("invalid-argument", "email inválido.");
  }

  const db = getFirestore();
  await db.collection("authorizedEmails").add({ email });
});

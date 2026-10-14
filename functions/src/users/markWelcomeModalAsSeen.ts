import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";

export const markWelcomeModalAsSeen = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Usuário não autenticado.");
  }

  const db = getFirestore();
  const userRef = db.collection("users").doc(request.auth.uid);
  await userRef.set({ hasSeenWelcomeModal: true }, { merge: true });
});

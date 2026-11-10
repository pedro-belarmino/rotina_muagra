import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

export const ensureUserProfile = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Usuário não autenticado.");
  }

  const { uid, token } = request.auth;
  const db = getFirestore();
  const userRef = db.collection("users").doc(uid);
  const snapshot = await userRef.get();

  if (!snapshot.exists) {
    await userRef.set({
      uid,
      displayName: token.name ?? null,
      email: token.email ?? null,
      photoURL: token.picture ?? null,
      createdAt: Timestamp.now(),
      hasSeenWelcomeModal: false,
    });
    return { isNew: true, hasSeenWelcomeModal: false };
  }

  const userData = snapshot.data() as Record<string, unknown>;
  return { isNew: false, hasSeenWelcomeModal: userData.hasSeenWelcomeModal ?? null };
});

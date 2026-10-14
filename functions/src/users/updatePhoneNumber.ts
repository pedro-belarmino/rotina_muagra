import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

// Mesmo formato validado em src/utils/phone.ts e firestore.rules.
const E164_REGEX = /^\+[1-9]\d{7,14}$/;

export const updatePhoneNumber = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Usuário não autenticado.");
  }

  const { phoneNumber } = request.data ?? {};
  if (typeof phoneNumber !== "string" || !E164_REGEX.test(phoneNumber)) {
    throw new HttpsError(
      "invalid-argument",
      "phoneNumber deve estar no formato E.164 (ex.: +5511999999999)."
    );
  }

  // O uid vem do token, nunca do payload. update() falha se o perfil ainda
  // não existir, evitando criar um documento parcial sem uid/email/createdAt.
  const db = getFirestore();
  const userRef = db.collection("users").doc(request.auth.uid);
  try {
    await userRef.update({
      phoneNumber,
      phoneNumberUpdatedAt: Timestamp.now(),
    });
  } catch (error) {
    // gRPC NOT_FOUND (5): documento users/{uid} inexistente.
    if ((error as { code?: number }).code === 5) {
      throw new HttpsError(
        "failed-precondition",
        "Perfil do usuário não encontrado."
      );
    }
    throw error;
  }
});

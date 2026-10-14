import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { isAdminEmail } from "./admin";

export function assertAdmin(request: CallableRequest): void {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Usuário não autenticado.");
  }
  if (!isAdminEmail(request.auth.token.email)) {
    throw new HttpsError(
      "permission-denied",
      "Requer privilégio de administrador."
    );
  }
}

export function assertOwnUid(request: CallableRequest, userId: unknown): asserts userId is string {
  if (!request.auth || typeof userId !== "string" || request.auth.uid !== userId) {
    throw new HttpsError(
      "permission-denied",
      "userId não corresponde ao usuário autenticado."
    );
  }
}

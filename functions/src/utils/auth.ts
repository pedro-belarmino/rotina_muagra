import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
    admin.initializeApp();
}

export const db = admin.firestore();

export function requireAuth(request: CallableRequest): { uid: string; email: string } {
    if (!request.auth || !request.auth.uid) {
        throw new HttpsError(
            "unauthenticated",
            "Usuário não autenticado."
        );
    }
    const uid = request.auth.uid;
    const email = request.auth.token.email || "";
    return { uid, email };
}

export async function checkUserPermissions(email: string): Promise<{ isAuthorized: boolean; isAuthorizedPartial: boolean }> {
    if (!email) {
        return { isAuthorized: false, isAuthorizedPartial: false };
    }

    const [authSnap, partialSnap] = await Promise.all([
        db.collection("authorizedEmails").where("email", "==", email).get(),
        db.collection("authorizedEmailsPartial").where("email", "==", email).get(),
    ]);

    const isAuthorized = !authSnap.empty;
    const isAuthorizedPartial = !partialSnap.empty;

    return { isAuthorized, isAuthorizedPartial };
}

export async function requireAuthorizedUser(request: CallableRequest): Promise<{ uid: string; email: string; isAuthorized: boolean; isAuthorizedPartial: boolean }> {
    const { uid, email } = requireAuth(request);
    const { isAuthorized, isAuthorizedPartial } = await checkUserPermissions(email);

    return { uid, email, isAuthorized, isAuthorizedPartial };
}

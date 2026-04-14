import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";
import type { AppUser } from "../types/User";

const usersCollection = collection(db, "users");
const authorizedEmailsCollection = collection(db, "authorizedEmails");
const authorizedEmailsPartialCollection = collection(db, "authorizedEmailsPartial");

export const getAllUsersWithAccessLevel = async (): Promise<AppUser[]> => {
    try {
        const [usersSnap, fullAuthSnap, partialAuthSnap] = await Promise.all([
            getDocs(query(usersCollection, orderBy("createdAt", "desc"))),
            getDocs(authorizedEmailsCollection),
            getDocs(authorizedEmailsPartialCollection)
        ]);

        const fullAuthEmails = new Set(fullAuthSnap.docs.map(doc => doc.data().email?.toLowerCase()));
        const partialAuthEmails = new Set(partialAuthSnap.docs.map(doc => doc.data().email?.toLowerCase()));

        return usersSnap.docs.map(doc => {
            const data = doc.data();
            const email = data.email?.toLowerCase();
            let accessLevel: 'full' | 'partial' | 'none' = 'none';

            if (fullAuthEmails.has(email)) {
                accessLevel = 'full';
            } else if (partialAuthEmails.has(email)) {
                accessLevel = 'partial';
            }

            return {
                uid: doc.id,
                displayName: data.displayName || null,
                email: data.email || null,
                photoURL: data.photoURL || null,
                createdAt: data.createdAt,
                accessLevel
            } as AppUser;
        });
    } catch (error) {
        console.error("Error fetching users with access levels:", error);
        throw error;
    }
};

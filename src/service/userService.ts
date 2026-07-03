import { db } from "../firebase/config";
import { collection, getDocs, doc, getDoc, query, orderBy, Timestamp } from "firebase/firestore";

export interface UserProfile {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    createdAt: Timestamp;
    hasSeenWelcomeModal: boolean;
}

export async function getAllUsers(): Promise<UserProfile[]> {
    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
    } as UserProfile));
}

export async function getUserStats(userId: string) {
    // Total clicks on the gratitude button (dailyCounters)
    const countersRef = collection(db, "users", userId, "dailyCounters");
    const snapshot = await getDocs(countersRef);

    let totalClicks = 0;
    let lastClick: Timestamp | null = null;

    snapshot.forEach(doc => {
        const data = doc.data();
        totalClicks += (data.value || 0);

        if (data.updatedAt) {
            const updatedAt = data.updatedAt as Timestamp;
            if (!lastClick || updatedAt.toMillis() > lastClick.toMillis()) {
                lastClick = updatedAt;
            }
        }
    });

    return {
        totalClicks,
        lastClick
    };
}

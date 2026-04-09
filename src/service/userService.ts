import { collection, query, orderBy, limit, startAfter, getDocs, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { db } from "../firebase/config";
import { UserProfile } from "../types/User";

const usersCollection = collection(db, "users");

export const getUsersPaginated = async (pageSize: number, lastVisible: QueryDocumentSnapshot<DocumentData> | null = null) => {
    try {
        let q;
        if (lastVisible) {
            q = query(
                usersCollection,
                orderBy("createdAt", "desc"),
                startAfter(lastVisible),
                limit(pageSize)
            );
        } else {
            q = query(
                usersCollection,
                orderBy("createdAt", "desc"),
                limit(pageSize)
            );
        }

        const querySnapshot = await getDocs(q);
        const users: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
            users.push(doc.data() as UserProfile);
        });

        const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

        return { users, lastDoc };
    } catch (error) {
        console.error("Error fetching users: ", error);
        throw error;
    }
};

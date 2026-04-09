import { Timestamp } from "firebase/firestore";

export type UserProfile = {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    createdAt: Timestamp;
};

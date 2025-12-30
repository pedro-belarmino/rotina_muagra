import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/config";

const authorizedEmailsCollection = collection(db, "authorizedEmails");

export const addAuthorizedEmail = async (email: string) => {
    try {
        await addDoc(authorizedEmailsCollection, { email });
    } catch (error) {
        console.error("Error adding authorized email: ", error);
        throw error;
    }
};

export const isEmailAuthorized = async (email: string): Promise<boolean> => {
    try {
        const q = query(authorizedEmailsCollection, where("email", "==", email));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error("Error checking if email is authorized: ", error);
        throw error;
    }
};

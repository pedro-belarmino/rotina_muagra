import { db } from "../firebase/config";
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    increment,
    Timestamp,
    collection,
    getDocs,
} from "firebase/firestore";

// const getTodayKey = () => {
//     const today = new Date();
//     return today.toISOString().split("T")[0];
// };

const getTodayKey = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};



export async function getDailyCounter(userId: string, dateKey?: string): Promise<{ value: number, comment: string }> {
    const key = dateKey ?? getTodayKey();
    const counterRef = doc(db, "users", userId, "dailyCounters", key);
    const snap = await getDoc(counterRef);

    if (!snap.exists()) {
        return { value: 0, comment: "" };
    }

    const data = snap.data() as { value: number, comment: string };
    return { value: data.value, comment: data.comment || "" };
}


export async function incrementDailyCounter(userId: string): Promise<number> {
    const todayKey = getTodayKey();
    const counterRef = doc(db, "users", userId, "dailyCounters", todayKey);
    const snap = await getDoc(counterRef);

    if (!snap.exists()) {

        await setDoc(counterRef, {
            value: 1,
            dateKey: todayKey,
            updatedAt: Timestamp.now(),
            comment: "",
        });
        return 1;
    }

    const data = snap.data() as { value: number };

    await updateDoc(counterRef, {
        value: increment(1),
        updatedAt: Timestamp.now(),
    });

    return data.value + 1;
}


export async function updateDailyComment(userId: string, comment: string): Promise<void> {
    const todayKey = getTodayKey();
    const counterRef = doc(db, "users", userId, "dailyCounters", todayKey);
    const snap = await getDoc(counterRef);

    if (!snap.exists()) {
        await setDoc(counterRef, {
            value: 0,
            dateKey: todayKey,
            updatedAt: Timestamp.now(),
            comment: comment,
        });
    } else {
        await updateDoc(counterRef, {
            comment: comment,
            updatedAt: Timestamp.now(),
        });
    }
}


export async function getAllDailyCounters(userId: string): Promise<{ dateKey: string; value: number; comment: string }[]> {
    const countersRef = collection(db, "users", userId, "dailyCounters");
    const snap = await getDocs(countersRef);

    const result: { dateKey: string; value: number; comment: string }[] = [];
    snap.forEach(docSnap => {
        const data = docSnap.data() as { value: number; dateKey: string; comment: string };
        result.push({ dateKey: data.dateKey, value: data.value, comment: data.comment || "" });
    });

    return result;
}


export async function getTotalCounter(userId: string): Promise<number> {
    const all = await getAllDailyCounters(userId);
    return all.reduce((acc, cur) => acc + cur.value, 0);
}

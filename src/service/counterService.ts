import { db } from "../firebase/config";
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    increment,
    serverTimestamp,
    collection,
    getDocs,
} from "firebase/firestore";

const getTodayKey = () => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // yyyy-mm-dd
};

//  Pegar valor de um dia específico
export async function getDailyCounter(userId: string, dateKey?: string): Promise<number> {
    const key = dateKey ?? getTodayKey();
    const counterRef = doc(db, "users", userId, "dailyCounters", key);
    const snap = await getDoc(counterRef);

    if (!snap.exists()) {
        return 0;
    }

    const data = snap.data() as { value: number };
    return data.value;
}

//  Incrementar o contador do dia atual
export async function incrementDailyCounter(userId: string): Promise<number> {
    const todayKey = getTodayKey();
    const counterRef = doc(db, "users", userId, "dailyCounters", todayKey);
    const snap = await getDoc(counterRef);

    if (!snap.exists()) {
        // cria já com valor 1
        await setDoc(counterRef, {
            value: 1,
            dateKey: todayKey,
            updatedAt: serverTimestamp(),
        });
        return 1;
    }

    const data = snap.data() as { value: number };

    await updateDoc(counterRef, {
        value: increment(1),
        updatedAt: serverTimestamp(),
    });

    return data.value + 1;
}

//  Buscar todos os dias (histórico)
export async function getAllDailyCounters(userId: string): Promise<{ dateKey: string; value: number }[]> {
    const countersRef = collection(db, "users", userId, "dailyCounters");
    const snap = await getDocs(countersRef);

    const result: { dateKey: string; value: number }[] = [];
    snap.forEach(docSnap => {
        const data = docSnap.data() as { value: number; dateKey: string };
        result.push({ dateKey: data.dateKey, value: data.value });
    });

    return result;
}

//  Somar valor total de todos os dias
export async function getTotalCounter(userId: string): Promise<number> {
    const all = await getAllDailyCounters(userId);
    return all.reduce((acc, cur) => acc + cur.value, 0);
}

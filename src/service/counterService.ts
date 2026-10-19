import { db, functions } from "../firebase/config";
import { getNowInBrasilia } from "../utils/period";
import {
    doc,
    getDoc,
    collection,
    getDocs,
    query,
    where,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";

export const getTodayKey = () => {
    const today = getNowInBrasilia();
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

export async function incrementDailyCounter(_userId: string): Promise<number> {
    const incrementFn = httpsCallable<any, { value: number }>(functions, "incrementDailyCounter");
    const res = await incrementFn();
    return res.data.value;
}

export async function updateDailyComment(_userId: string, comment: string): Promise<void> {
    const commentFn = httpsCallable<any, { success: boolean }>(functions, "updateDailyComment");
    await commentFn({ comment });
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

export async function getMonthlyCounters(userId: string, date: Date): Promise<number> {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const startDate = `${year}-${month}-01`;
    const endDate = `${year}-${month}-31`;

    const countersRef = collection(db, "users", userId, "dailyCounters");
    const q = query(countersRef, where("dateKey", ">=", startDate), where("dateKey", "<=", endDate));

    const snap = await getDocs(q);

    let total = 0;
    snap.forEach(docSnap => {
        total += (docSnap.data().value || 0);
    });

    return total;
}

export async function getDailyCountersByPeriod(
    userId: string,
    startDate: Date,
    endDate: Date
): Promise<{ dateKey: string; value: number; comment: string }[]> {
    const start = startDate.toISOString().split("T")[0];
    const end = endDate.toISOString().split("T")[0];

    const countersRef = collection(db, "users", userId, "dailyCounters");
    const q = query(
        countersRef,
        where("dateKey", ">=", start),
        where("dateKey", "<=", end)
    );

    const snap = await getDocs(q);

    const result: { dateKey: string; value: number; comment: string }[] = [];
    snap.forEach(docSnap => {
        const data = docSnap.data() as {
            value: number;
            dateKey: string;
            comment: string;
        };
        result.push({
            dateKey: data.dateKey,
            value: data.value,
            comment: data.comment || "",
        });
    });

    return result;
}

export async function getYearlyDays(userId: string, date: Date): Promise<number> {
    const year = date.getFullYear();
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const countersRef = collection(db, "users", userId, "dailyCounters");
    const q = query(countersRef, where("dateKey", ">=", startDate), where("dateKey", "<=", endDate));

    const snap = await getDocs(q);
    return snap.size;
}

export async function getMonthlyDays(userId: string, date: Date): Promise<number> {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const startDate = `${year}-${month}-01`;
    const endDate = `${year}-${month}-31`;

    const countersRef = collection(db, "users", userId, "dailyCounters");
    const q = query(countersRef, where("dateKey", ">=", startDate), where("dateKey", "<=", endDate));

    const snap = await getDocs(q);
    return snap.size;
}

export async function getYearlyCounters(userId: string, date: Date): Promise<number> {
    const year = date.getFullYear();
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;

    const countersRef = collection(db, "users", userId, "dailyCounters");
    const q = query(countersRef, where("dateKey", ">=", startDate), where("dateKey", "<=", endDate));

    const snap = await getDocs(q);

    let total = 0;
    snap.forEach(docSnap => {
        total += (docSnap.data().value || 0);
    });

    return total;
}

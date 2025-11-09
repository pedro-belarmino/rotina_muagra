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
    runTransaction,
    query,
    where,
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
    const userCounterRef = doc(db, "users", userId, "dailyCounters", todayKey);
    const globalCounterRef = doc(db, "GlobalCounter", "global_counter");

    return await runTransaction(db, async (transaction) => {
        const userCounterSnap = await transaction.get(userCounterRef);
        const globalCounterSnap = await transaction.get(globalCounterRef);

        if (!userCounterSnap.exists()) {
            transaction.set(userCounterRef, {
                value: 1,
                dateKey: todayKey,
                updatedAt: Timestamp.now(),
                comment: "",
            });

            if (!globalCounterSnap.exists()) {
                transaction.set(globalCounterRef, { value: 1 });
            } else {
                transaction.update(globalCounterRef, { value: increment(1) });
            }
            return 1;
        }

        const data = userCounterSnap.data() as { value: number };
        transaction.update(userCounterRef, {
            value: increment(1),
            updatedAt: Timestamp.now(),
        });

        if (!globalCounterSnap.exists()) {
            transaction.set(globalCounterRef, { value: 1 });
        } else {
            transaction.update(globalCounterRef, { value: increment(1) });
        }

        return data.value + 1;
    });
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

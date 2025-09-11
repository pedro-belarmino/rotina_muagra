import { db } from "../firebase/config";
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    increment,
    serverTimestamp,
} from "firebase/firestore";

const getTodayKey = () => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // yyyy-mm-dd
};

// Buscar valor atual do contador
export async function getDailyCounter(userId: string): Promise<number> {
    const counterRef = doc(db, "users", userId, "meta", "dailyCounter");
    const snap = await getDoc(counterRef);

    const todayKey = getTodayKey();

    if (!snap.exists()) {
        // Se não existe, cria zerado
        await setDoc(counterRef, {
            value: 0,
            dateKey: todayKey,
            updatedAt: serverTimestamp(),
        });
        return 0;
    }

    const data = snap.data() as { value: number; dateKey: string };

    // Se é de outro dia, resetar
    if (data.dateKey !== todayKey) {
        await setDoc(counterRef, {
            value: 0,
            dateKey: todayKey,
            updatedAt: serverTimestamp(),
        });
        return 0;
    }

    return data.value;
}

// Incrementar em +1
export async function incrementDailyCounter(userId: string): Promise<number> {
    const counterRef = doc(db, "users", userId, "meta", "dailyCounter");
    const todayKey = getTodayKey();
    const snap = await getDoc(counterRef);

    if (!snap.exists()) {
        // Se não existe, cria já com valor 1
        await setDoc(counterRef, {
            value: 1,
            dateKey: todayKey,
            updatedAt: serverTimestamp(),
        });
        return 1;
    }

    const data = snap.data() as { value: number; dateKey: string };

    if (data.dateKey !== todayKey) {
        // Se é de outro dia, resetar e começar do 1
        await setDoc(counterRef, {
            value: 1,
            dateKey: todayKey,
            updatedAt: serverTimestamp(),
        });
        return 1;
    }

    // Se é do mesmo dia, incrementar
    await updateDoc(counterRef, {
        value: increment(1),
        dateKey: todayKey,
        updatedAt: serverTimestamp(),
    });

    return data.value + 1;
}

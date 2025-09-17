import {
    collection,
    addDoc,
    deleteDoc,
    getDocs,
    query,
    where,
    Timestamp,
    doc,
    DocumentReference,
    getDoc,
    increment,
    runTransaction,
} from "firebase/firestore";
import { db } from "../firebase/config";
import type { TaskLog } from "../types/TaskLog";
import type { Task } from "../types/Task";

/* ---------- Helpers locais ---------- */
function formatISODate(d: Date): string {
    const year = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${m}-${day}`;
}

function getPeriodStartForType(date: Date, type?: "monthly" | "weekly" | "general" | ""): string | null {
    if (!type) return null;
    if (type === "monthly") {
        const start = new Date(date.getFullYear(), date.getMonth(), 1);
        start.setHours(0, 0, 0, 0);
        return formatISODate(start);
    }
    if (type === "weekly") {
        const d = new Date(date);
        const day = d.getDay(); // 0 = Sunday
        const diff = d.getDate() - day;
        const sunday = new Date(d.setDate(diff));
        sunday.setHours(0, 0, 0, 0);
        return formatISODate(sunday);
    }
    return null;
}

// Adicionar log com snapshot da tarefa
export const addTaskLog = async (
    uid: string,
    log: TaskLog,
    taskName: string,
    measure: string
) => {
    const logsRef = collection(db, "users", uid, "taskLogs");
    //   const tasksCollectionPath = (taskId: string) => doc(db, "users", uid, "tasks", taskId);

    const doneDate = new Date(log.doneAt);
    const dayKey = formatISODate(doneDate);

    // 1) verificar de forma rápida se já existe log para taskId+day
    const existing = await getTaskLogByDate(uid, log.taskId, dayKey);

    if (existing) {
        // já existe marcação para esse dia -> só adiciona o log (não altera task.days)
        const docRef = await addDoc(logsRef, {
            taskId: log.taskId,
            taskName,
            measure,
            doneAt: Timestamp.fromDate(doneDate),
            value: log.value,
            userId: uid,
            day: dayKey,
        });
        return docRef.id;
    }

    // 2) NÃO existe marcação para esse dia -> precisamos criar atomically:
    //    - um `dayMark` (users/{uid}/tasks/{taskId}/dayMarks/{dayKey})
    //    - o taskLog em taskLogs
    //    - e atualizar task.days / periodStart de forma segura
    const taskRef = doc(db, "users", uid, "tasks", log.taskId);
    const taskDayMarkRef = doc(db, "users", uid, "tasks", log.taskId, "dayMarks", dayKey);
    // criar novo docRef para o log (gerado localmente) para poder set dentro da transação
    const newLogRef = doc(collection(db, "users", uid, "taskLogs"));

    await runTransaction(db, async (transaction) => {
        // re-checar dayMark dentro da transação para garantir exclusividade
        const dayMarkSnap = await transaction.get(taskDayMarkRef);
        if (dayMarkSnap.exists()) {
            // Alguém criou o dayMark antes de nós -> significa que outro processo já considerou esse dia.
            // Neste caso, apenas criamos o log (sem mexer em task.days).
            transaction.set(newLogRef, {
                taskId: log.taskId,
                taskName,
                measure,
                doneAt: Timestamp.fromDate(doneDate),
                value: log.value,
                userId: uid,
                day: dayKey,
            });
            return;
        }

        // obter task atual
        const taskSnap = await transaction.get(taskRef);
        if (!taskSnap.exists()) {
            // tarefa não existe (inconsistência) -> ainda assim criamos o log, sem mexer em counts
            transaction.set(newLogRef, {
                taskId: log.taskId,
                taskName,
                measure,
                doneAt: Timestamp.fromDate(doneDate),
                value: log.value,
                userId: uid,
                day: dayKey,
            });
            return;
        }

        const taskData = taskSnap.data() as Partial<Task>;
        const totalGoalType = (taskData.totalGoalType as any) ?? null;
        // criar dayMark
        transaction.set(taskDayMarkRef, {
            createdAt: Timestamp.fromDate(doneDate),
        });

        // criar log
        transaction.set(newLogRef, {
            taskId: log.taskId,
            taskName,
            measure,
            doneAt: Timestamp.fromDate(doneDate),
            value: log.value,
            userId: uid,
            day: dayKey,
        });

        // atualizar task.days levando em conta reset de período
        const now = new Date();
        const currentPeriodStart = getPeriodStartForType(now, totalGoalType as any);

        if (!currentPeriodStart) {
            // tarefa sem periodicidade (general) -> não atualizamos days (opcional)
            return;
        }

        const taskPeriodStart = taskData.periodStart ?? null;
        // const currentDays = (taskData.days ?? 0) as number;

        if (taskPeriodStart !== currentPeriodStart) {
            // período mudou -> set days = 1 e atualizar periodStart
            transaction.update(taskRef, { days: 1, periodStart: currentPeriodStart });
        } else {
            // mesmo período -> incrementa 1
            transaction.update(taskRef, { days: increment(1) });
        }
    });

    return newLogRef.id;
};


// Deletar log (se realmente necessário)
// agora: após deletar, se não restarem logs daquele taskId no mesmo day,
// remove dayMark e decrementa days (ou zera se período mudou)
export const deleteTaskLog = async (uid: string, logId: string) => {
    // primeiro pegar o log (para saber taskId e day)
    const logRef = doc(db, "users", uid, "taskLogs", logId);
    const logSnap = await getDocOrNull(logRef);
    if (!logSnap) return;

    const logData = logSnap.data();
    const taskId = logData.taskId as string;
    const dayKey = (logData.day as string) ?? formatISODate((logData.doneAt as Timestamp).toDate());

    // apagar o log
    await deleteDoc(logRef);

    // checar se ainda existem logs para esse task/day
    const logsRef = collection(db, "users", uid, "taskLogs");
    const q = query(logsRef, where("taskId", "==", taskId), where("day", "==", dayKey));
    const remainingLogs = await getDocs(q);

    if (!remainingLogs.empty) {
        // ainda existem logs no mesmo dia -> não mexer em days
        return;
    }

    // não restam logs -> remover dayMark e decrementar days (dentro de transação)
    const taskRef = doc(db, "users", uid, "tasks", taskId);
    const dayMarkRef = doc(db, "users", uid, "tasks", taskId, "dayMarks", dayKey);

    await runTransaction(db, async (transaction) => {
        const taskSnap = await transaction.get(taskRef);
        if (!taskSnap.exists()) {
            // tarefa apagada: só apagar dayMark se existir
            const dmSnap = await transaction.get(dayMarkRef);
            if (dmSnap.exists()) transaction.delete(dayMarkRef);
            return;
        }

        const taskData = taskSnap.data() as Partial<Task>;
        const totalGoalType = (taskData.totalGoalType as any) ?? null;

        // se o período mudou desde que o dayMark foi criado, não devemos decrementar
        const now = new Date();
        const currentPeriodStart = getPeriodStartForType(now, totalGoalType as any);

        if (!currentPeriodStart) {
            // tarefa sem periodicidade (general) -> apenas removemos dayMark
            const dmSnap = await transaction.get(dayMarkRef);
            if (dmSnap.exists()) transaction.delete(dayMarkRef);
            return;
        }

        const taskPeriodStart = taskData.periodStart ?? null;

        // deletar dayMark (se existir)
        const dmSnap = await transaction.get(dayMarkRef);
        if (dmSnap.exists()) transaction.delete(dayMarkRef);

        if (taskPeriodStart !== currentPeriodStart) {
            // o período já foi resetado -> sincronizar: set days = 0 e atualizar periodStart
            transaction.update(taskRef, { days: 0, periodStart: currentPeriodStart });
        } else {
            // mesmo período -> decrementar days (sem ficar negativo)
            const curDays = (taskData.days ?? 0) as number;
            const newDays = Math.max(0, curDays - 1);
            transaction.update(taskRef, { days: newDays });
        }
    });
};


// Buscar log por taskId e data
export const getTaskLogByDate = async (
    uid: string,
    taskId: string,
    dateKey: string
): Promise<TaskLog | null> => {
    const logsRef = collection(db, "users", uid, "taskLogs");
    // 1) query eficiente usando campo 'day' (novo)
    const q = query(logsRef, where("taskId", "==", taskId), where("day", "==", dateKey));
    const snap = await getDocs(q);
    if (!snap.empty) {
        const docSnap = snap.docs[0];
        const data = docSnap.data();
        return {
            id: docSnap.id,
            taskId: data.taskId,
            taskName: data.taskName,
            measure: data.measure,
            userId: uid,
            doneAt: (data.doneAt as Timestamp).toDate(),
            value: data.value,
        } as TaskLog;
    }

    // 2) fallback: talvez existam logs antigos sem campo 'day' -> varrer (compatibilidade)
    const qAll = query(logsRef, where("taskId", "==", taskId));
    const snapshot = await getDocs(qAll);
    for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const logDate = (data.doneAt as Timestamp).toDate();
        const logKey = logDate.toISOString().split("T")[0];

        if (logKey === dateKey) {
            return {
                id: docSnap.id,
                taskId: data.taskId,
                taskName: data.taskName,
                measure: data.measure,
                userId: uid,
                doneAt: logDate,
                value: data.value,
            } as TaskLog;
        }
    }

    return null;
};

// Buscar todos os logs
export async function getAllTaskLogs(uid: string): Promise<TaskLog[]> {
    const logsRef = collection(db, "users", uid, "taskLogs");
    const snap = await getDocs(logsRef);

    return snap.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
            id: docSnap.id,
            taskId: data.taskId,
            taskName: data.taskName,
            measure: data.measure,
            userId: uid,
            doneAt: (data.doneAt as Timestamp).toDate(),
            value: data.value,
        } as TaskLog;
    });
}

async function getDocOrNull(ref: DocumentReference) {
    try {
        const snap = await getDoc(ref);
        if (!snap.exists()) return null;
        return snap;
    } catch (e) {
        console.error("getDoc failed:", e);
        return null;
    }
}
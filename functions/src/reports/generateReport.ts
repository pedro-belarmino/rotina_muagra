import { onCall, HttpsError } from "firebase-functions/v2/https";
import { db, requireAuth } from "../utils/auth";
import type { GenerateReportInput, ReportResult, ReportTaskBalance, Task } from "../types";
import * as admin from "firebase-admin";

export const generateReport = onCall({ maxInstances: 10 }, async (request) => {
    const { uid } = requireAuth(request);
    const data = request.data as GenerateReportInput;

    if (!data.startDate || !data.endDate) {
        throw new HttpsError("invalid-argument", "Datas de início e fim são obrigatórias.");
    }

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    endDate.setHours(23, 59, 59, 999);

    const selectedTaskIds = Array.isArray(data.selectedTaskIds) ? data.selectedTaskIds : [];
    if (selectedTaskIds.length === 0) {
        return {
            generalBalance: 0,
            taskBalances: [],
            counters: [],
        } as ReportResult;
    }

    const tasksSnap = await db.collection("users").doc(uid).collection("tasks").get();
    const allTasks = tasksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
    const selectedTasks = allTasks.filter(t => t.id && selectedTaskIds.includes(t.id));

    const taskLogs: any[] = [];
    const chunks: string[][] = [];
    for (let i = 0; i < selectedTaskIds.length; i += 30) {
        chunks.push(selectedTaskIds.slice(i, i + 30));
    }

    for (const chunk of chunks) {
        const qSnap = await db.collection("users").doc(uid).collection("taskLogs")
            .where("taskId", "in", chunk)
            .where("doneAt", ">=", admin.firestore.Timestamp.fromDate(startDate))
            .where("doneAt", "<=", admin.firestore.Timestamp.fromDate(endDate))
            .get();

        qSnap.docs.forEach(doc => {
            const l = doc.data();
            taskLogs.push({
                id: doc.id,
                ...l,
                doneAt: (l.doneAt as admin.firestore.Timestamp).toDate(),
            });
        });
    }

    const startISO = data.startDate.split("T")[0];
    const endISO = data.endDate.split("T")[0];
    const countersSnap = await db.collection("users").doc(uid).collection("dailyCounters")
        .where("dateKey", ">=", startISO)
        .where("dateKey", "<=", endISO)
        .get();

    const counters = countersSnap.docs.map(doc => {
        const c = doc.data();
        return {
            dateKey: c.dateKey as string,
            value: (c.value || 0) as number,
        };
    });

    const timeDiff = endDate.getTime() - startDate.getTime();
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24));

    const taskBalances: ReportTaskBalance[] = selectedTasks.map(task => {
        let dateFromTask: Date;
        if (task.createdAt && typeof task.createdAt.toDate === 'function') {
            dateFromTask = task.createdAt.toDate();
        } else if (task.createdAt) {
            dateFromTask = new Date(task.createdAt);
        } else {
            dateFromTask = startDate;
        }

        const taskStartDate = dateFromTask > startDate ? dateFromTask : startDate;
        const taskTimeDiff = endDate.getTime() - taskStartDate.getTime();
        const taskDays = Math.max(1, Math.ceil(taskTimeDiff / (1000 * 3600 * 24)));

        const logs = taskLogs.filter(log => log.taskId === task.id);

        let totalDone: number;
        let totalGoal: number;
        let percentage: number;

        const dailyGoalNum = typeof task.dailyGoal === 'string' ? Number(task.dailyGoal) : (task.dailyGoal || 0);

        if (!dailyGoalNum) {
            const uniqueDays = new Set(
                logs.map(log => log.doneAt.toISOString().split('T')[0])
            );
            totalDone = uniqueDays.size;
            totalGoal = taskDays;
            percentage = totalGoal > 0 ? (totalDone / totalGoal) * 100 : 0;
        } else {
            totalDone = logs.reduce((sum, log) => sum + log.value, 0);
            totalGoal = dailyGoalNum * taskDays;
            percentage = totalGoal > 0 ? (totalDone / totalGoal) * 100 : 0;
        }

        return {
            id: task.id!,
            name: task.name,
            measure: task.measure,
            dailyGoal: task.dailyGoal,
            totalDone,
            totalGoal,
            percentage,
        };
    });

    const generalBalance = taskBalances.length > 0
        ? taskBalances.reduce((sum, task) => sum + task.percentage, 0) / taskBalances.length
        : 0;

    let aggregatedCounters: { dateKey: string; value: number }[];

    if (days <= 31) {
        aggregatedCounters = counters;
    } else if (days <= 90) {
        const weeklyData: { [key: string]: number } = {};
        counters.forEach(c => {
            const date = new Date(c.dateKey);
            const weekStart = new Date(date.setDate(date.getDate() - date.getDay())).toISOString().split('T')[0];
            if (!weeklyData[weekStart]) {
                weeklyData[weekStart] = 0;
            }
            weeklyData[weekStart] += c.value;
        });
        aggregatedCounters = Object.entries(weeklyData).map(([dateKey, value]) => ({ dateKey, value }));
    } else {
        const monthlyData: { [key: string]: number } = {};
        counters.forEach(c => {
            const monthKey = c.dateKey.substring(0, 7);
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = 0;
            }
            monthlyData[monthKey] += c.value;
        });
        aggregatedCounters = Object.entries(monthlyData).map(([dateKey, value]) => ({ dateKey, value }));
    }

    return {
        generalBalance,
        taskBalances,
        counters: aggregatedCounters,
    } as ReportResult;
});

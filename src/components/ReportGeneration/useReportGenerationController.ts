
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getTaskLogsByPeriod } from "../../service/taskLogService";
import { getDailyCountersByPeriod } from "../../service/counterService";
import { Task } from "../../types/Task";

export const useReportGenerationController = (tasks: Task[]) => {
    const { user } = useAuth();
    const [configModalOpen, setConfigModalOpen] = useState(false);
    const [displayModalOpen, setDisplayModalOpen] = useState(false);
    const [reportData, setReportData] = useState<any>(null);

    const handleGenerateReport = async (
        startDate: Date,
        endDate: Date,
        selectedTaskIds: string[]
    ) => {
        if (!user) return;

        // Adjust endDate to the end of the day
        const adjustedEndDate = new Date(endDate);
        adjustedEndDate.setHours(23, 59, 59, 999);

        // Fetch data
        const taskLogs = await getTaskLogsByPeriod(user.uid, startDate, adjustedEndDate, selectedTaskIds);
        const counters = await getDailyCountersByPeriod(user.uid, startDate, endDate);

        // Process data
        const selectedTasks = tasks.filter(t => selectedTaskIds.includes(t.id!));

        const timeDiff = adjustedEndDate.getTime() - startDate.getTime();
        const days = Math.ceil(timeDiff / (1000 * 3600 * 24));

        const taskBalances = selectedTasks.map(task => {
            const taskStartDate = task.createdAt?.toDate() > startDate ? task.createdAt.toDate() : startDate;
            const taskTimeDiff = adjustedEndDate.getTime() - taskStartDate.getTime();
            const taskDays = Math.ceil(taskTimeDiff / (1000 * 3600 * 24));

            const logs = taskLogs.filter(log => log.taskId === task.id);
            const totalDone = logs.reduce((sum, log) => sum + log.value, 0);
            const totalGoal = (task.dailyGoal ?? 1) * taskDays;
            const percentage = totalGoal > 0 ? (totalDone / totalGoal) * 100 : 0;
            return {
                ...task,
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
            // Group by day (no change)
            aggregatedCounters = counters;
        } else if (days <= 90) {
            // Group by week
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
            // Group by month
            const monthlyData: { [key: string]: number } = {};
            counters.forEach(c => {
                const monthKey = c.dateKey.substring(0, 7); // YYYY-MM
                if (!monthlyData[monthKey]) {
                    monthlyData[monthKey] = 0;
                }
                monthlyData[monthKey] += c.value;
            });
            aggregatedCounters = Object.entries(monthlyData).map(([dateKey, value]) => ({ dateKey, value }));
        }

        setReportData({
            generalBalance,
            taskBalances,
            counters: aggregatedCounters,
        });

        // Open display modal
        setConfigModalOpen(false);
        setDisplayModalOpen(true);
    };

    return {
        configModalOpen,
        displayModalOpen,
        openConfigModal: () => setConfigModalOpen(true),
        closeConfigModal: () => setConfigModalOpen(false),
        openDisplayModal: () => setDisplayModalOpen(true),
        closeDisplayModal: () => setDisplayModalOpen(false),
        generateReport: handleGenerateReport,
        reportData,
    };
};

export type TotalGoalType = 'monthly' | 'weekly' | 'general' | '';

export type TaskType = 'personal' | 'gratitude';

export interface Task {
    id?: string;
    name: string;
    description?: string;
    measure?: string;
    dailyGoal?: number | string;
    totalGoal?: number | string;
    totalGoalType?: TotalGoalType;
    createdAt?: any;
    schedule: string;
    dailyTask: boolean;
    archived?: boolean;
    days?: number;
    periodStart?: string | null;
    daysYear?: number;
    yearStart?: string | null;
    totalMonth?: number;
    totalYear?: number;
    priority?: any;
    taskType?: TaskType;
    gratitudeTrack?: string;
    icon?: string;
}

export interface TaskLog {
    id?: string;
    taskId: string;
    userId: string;
    doneAt: any;
    value: number;
    measure?: string;
    taskName?: string;
    day?: string;
}

export interface DailyCounter {
    value: number;
    dateKey: string;
    comment?: string;
    updatedAt?: any;
}

export interface CreateTaskInput {
    name: string;
    description?: string;
    measure?: string;
    dailyGoal?: number | string;
    totalGoal?: number | string;
    totalGoalType?: TotalGoalType;
    schedule: string;
    dailyTask?: boolean;
    taskType?: TaskType;
    gratitudeTrack?: string;
    icon?: string;
}

export interface UpdateTaskInput {
    taskId: string;
    updates: Partial<Task>;
}

export interface CreateTaskLogInput {
    taskId: string;
    doneAt?: string | number; // ISO string or epoch ms
    value: number;
    measure?: string;
    taskName?: string;
}

export interface DeleteTaskLogInput {
    logId: string;
}

export interface GenerateReportInput {
    startDate: string; // ISO date
    endDate: string; // ISO date
    selectedTaskIds: string[];
}

export interface ReportTaskBalance {
    id: string;
    name: string;
    measure?: string;
    dailyGoal?: number | string;
    totalDone: number;
    totalGoal: number;
    percentage: number;
}

export interface ReportResult {
    generalBalance: number;
    taskBalances: ReportTaskBalance[];
    counters: { dateKey: string; value: number }[];
}

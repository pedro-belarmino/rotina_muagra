export type Task = {
    id?: string;
    name: string;
    measure?: "m" | "km" | "repetition" | "hour" | 'minute' | '';
    description?: string;
    dailyGoal: number;
    totalGoal?: number;
    totalGoalType?: 'monthly' | 'weekly' | 'general' | '';
    archived: boolean;
    createdAt: any; // Timestamp do Firestore
    schedule: string; // "HH:mm"
    dailyTask: boolean;

    days?: number; // quantos dias no período atual
    periodStart?: string | null; // data 'YYYY-MM-DD' que marca o início do período atual (semana/mes) para essa tarefa


};


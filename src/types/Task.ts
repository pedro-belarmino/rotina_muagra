export type Task = {
    id?: string;
    name: string;
    measure?: "m" | "km" | "repetition" | "hour" | 'minute' | 'liter' | 'milliliter' | '';
    description?: string;
    dailyGoal: number;
    totalGoal?: number;
    totalGoalType?: 'monthly';
    archived: boolean;
    createdAt: any;
    schedule: string;
    dailyTask: boolean;

    days?: number;
    periodStart?: string | null;

    daysYear?: number;
    yearStart?: string | null;

    totalMonth?: number;
    totalYear?: number;

    priority?: any;
    taskType?: 'personal' | 'gratitude';
    gratitudeTrack?: 'semente' | 'broto' | 'flor' | 'fruto' | 'arvore' | 'floresta' | 'guardião' | 'infinito' | '';
    icon?: string;
};


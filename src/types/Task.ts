export type Task = {
    id?: string;
    name: string;
    measure?: "m" | "km" | "repetition" | "hour" | 'minute' | 'liter' | 'milliliter' | '';
    description?: string;
    dailyGoal: number;
    totalGoal?: number;
    totalGoalType?: 'monthly';
    archived: boolean;
    createdAt: any; // Timestamp do Firestore
    schedule: string; // "HH:mm"
    dailyTask: boolean;

    days?: number; // quantos dias no período atual
    periodStart?: string | null; // data 'YYYY-MM-DD' que marca o início do período atual (semana/mes) para essa tarefa

    daysYear?: number; //  novo campo: dias feitos no ano
    yearStart?: string | null; //  marca início do ano "YYYY"

    totalMonth?: number;  //  novo: medida acumulada do mês
    totalYear?: number;   // novo: medida acumulada do ano

    priority?: any; // Timestamp do Firestore
    taskType?: 'personal' | 'gratitude';
    gratitudeTrack?: 'semente' | 'broto' | 'flor' | 'fruto' | 'arvore' | 'floresta' | 'guardião' | 'infinito';
};


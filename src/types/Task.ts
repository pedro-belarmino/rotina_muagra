export type Task = {
    id?: string;
    name: string;
    description: string;
    measure: "m" | "km" | "repetition" | "hour" | 'minute' | '';
    dailyGoal: number;
    totalGoal: number;
    archived: boolean;
    createdAt: any; // Timestamp do Firestore
    schedule: string; // "HH:mm"
    dailyTask: boolean;
};

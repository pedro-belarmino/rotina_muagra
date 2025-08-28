export type Task = {
    id?: string;
    name: string;
    description: string;
    measure: "m" | "km" | "repetition" | "time";
    dailyGoal: number;
    totalGoal: number;
    createdAt: any; // Timestamp do Firestore
    schedule: string; // "HH:mm"
};

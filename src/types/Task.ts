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
    // days: Weekday[]
};

// type Weekday = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

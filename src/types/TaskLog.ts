export type TaskLog = {
    id?: string;
    taskId: string;
    userId: string;
    doneAt: Date;
    value: number;
    taskName: string;
    measure: string;
    createdAt?: Date;
    updatedAt?: Date;
};
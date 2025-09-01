export type TaskLog = {
    id?: string;
    taskId: string;
    userId: string;
    doneAt: Date;
    value: number;
    createdAt?: Date;
    updatedAt?: Date;
};
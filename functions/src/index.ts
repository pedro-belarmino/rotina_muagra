import { setGlobalOptions } from "firebase-functions";

setGlobalOptions({ maxInstances: 10 });

export { createTask } from "./tasks/createTask";
export { updateTask, deleteTask, ensureTaskPeriods } from "./tasks/updateTask";
export { createTaskLog, deleteTaskLog } from "./logs/taskLogs";
export { incrementDailyCounter, updateDailyComment } from "./counters/dailyCounters";
export { generateReport } from "./reports/generateReport";

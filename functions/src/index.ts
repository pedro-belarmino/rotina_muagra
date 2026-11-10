import { initializeApp } from "firebase-admin/app";
import { setGlobalOptions } from "firebase-functions";

setGlobalOptions({ maxInstances: 10 });
initializeApp();

export { addTask } from "./tasks/addTask";
export { updateTask } from "./tasks/updateTask";
export { updateTaskPriority } from "./tasks/updateTaskPriority";
export { archiveTask } from "./tasks/archiveTask";
export { deleteTaskPermanently } from "./tasks/deleteTaskPermanently";
export { ensureTasksAreCurrent } from "./tasks/ensureTasksAreCurrent";

export { addTaskLog } from "./taskLogs/addTaskLog";
export { deleteTaskLog } from "./taskLogs/deleteTaskLog";

export { incrementDailyCounter } from "./counters/incrementDailyCounter";
export { incrementMuagraFromN8n } from "./counters/incrementMuagraFromN8n";
export { updateDailyComment } from "./counters/updateDailyComment";

export { addAuthorizedEmail } from "./authorizedEmails/addAuthorizedEmail";
export { addAuthorizedEmailPartial } from "./authorizedEmails/addAuthorizedEmailPartial";

export { ensureUserProfile } from "./users/ensureUserProfile";
export { markWelcomeModalAsSeen } from "./users/markWelcomeModalAsSeen";
export { updatePhoneNumber } from "./users/updatePhoneNumber";
export { findUserByPhoneNumber } from "./users/findUserByPhoneNumber";
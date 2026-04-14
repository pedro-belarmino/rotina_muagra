import type { Task } from "../types/Task";

const CACHE_KEY = "app_tasks_data";

interface TaskCache {
    tasks: Task[];
    needsUpdate: boolean;
}

export const getTaskCache = (): TaskCache | null => {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (!cachedData) return null;
    try {
        return JSON.parse(cachedData);
    } catch (e) {
        console.error("Error parsing task cache", e);
        return null;
    }
};

export const setTaskCache = (tasks: Task[]) => {
    const cacheData: TaskCache = {
        tasks,
        needsUpdate: false,
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
};

export const invalidateTaskCache = () => {
    const cachedData = getTaskCache();
    if (cachedData) {
        cachedData.needsUpdate = true;
        localStorage.setItem(CACHE_KEY, JSON.stringify(cachedData));
    } else {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ tasks: [], needsUpdate: true }));
    }
};

export const clearTaskCache = () => {
    localStorage.removeItem(CACHE_KEY);
};

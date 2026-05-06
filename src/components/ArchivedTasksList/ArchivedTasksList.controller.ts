import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
    getTasks,
    updateTask,
    deleteTaskPermanently,
} from "../../service/taskService";
import type { Task } from "../../types/Task";

export function useArchivedTasksListController() {
    const { user } = useAuth();
    const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [deleteModal, setDeleteModal] = useState(false);
    const [unarchiveModal, setUnarchiveModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    function handleCloseModal() {
        setUnarchiveModal(false);
        setDeleteModal(false);
        setSelectedTask(null);
    }

    const fetchTasks = async (forceRefresh = false) => {
        if (!user) return;
        if (forceRefresh) {
            setLoading(true);
        }

        const userTasks = await getTasks(user.uid, true, forceRefresh);
        setArchivedTasks(userTasks.filter((task) => task.archived));
        setLoading(false);
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const confirmUnarchiveTask = async () => {
        if (user?.uid && selectedTask?.id) {
            await updateTask(user.uid, selectedTask.id, { archived: false });
            handleCloseModal();
            fetchTasks(true);
        }
    };

    const confirmDeleteTask = async () => {
        if (user?.uid && selectedTask?.id) {
            await deleteTaskPermanently(user.uid, selectedTask.id);
            handleCloseModal();
            fetchTasks(true);
        }
    };
    return {
        confirmDeleteTask,
        confirmUnarchiveTask,
        navigate,
        setSelectedTask,
        setUnarchiveModal,
        handleCloseModal,
        setDeleteModal,
        selectedTask,
        deleteModal,
        unarchiveModal,
        archivedTasks,
        loading,
    };
}

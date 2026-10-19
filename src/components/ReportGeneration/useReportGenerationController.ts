import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { functions } from "../../firebase/config";
import { httpsCallable } from "firebase/functions";
import type { Task } from "../../types/Task";

export const useReportGenerationController = (_tasks: Task[]) => {
    const { user } = useAuth();
    const [configModalOpen, setConfigModalOpen] = useState(false);
    const [displayModalOpen, setDisplayModalOpen] = useState(false);
    const [reportData, setReportData] = useState<any>(null);

    const handleGenerateReport = async (
        startDate: Date,
        endDate: Date,
        selectedTaskIds: string[]
    ) => {
        if (!user) {
            console.error("Usuário não autenticado");
            return;
        }

        try {
            const generateReportFn = httpsCallable<any, any>(functions, "generateReport");
            const res = await generateReportFn({
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                selectedTaskIds,
            });

            setReportData(res.data);
            setConfigModalOpen(false);
            setDisplayModalOpen(true);
        } catch (error) {
            console.error("Erro ao gerar relatório via Cloud Function:", error);
        }
    };

    return {
        configModalOpen,
        displayModalOpen,
        openConfigModal: () => setConfigModalOpen(true),
        closeConfigModal: () => setConfigModalOpen(false),
        openDisplayModal: () => setDisplayModalOpen(true),
        closeDisplayModal: () => setDisplayModalOpen(false),
        generateReport: handleGenerateReport,
        reportData,
    };
};

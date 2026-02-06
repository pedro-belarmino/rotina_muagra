import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAllDailyCounters } from "../../service/counterService";

export interface Milestone {
    value: number;
    label: string;
    image: string;
    reachedDate: string | null;
}

export const useCelebrationMilestonesController = () => {
    const { user } = useAuth();
    const [milestones, setMilestones] = useState<Milestone[]>([
        { value: 100, label: "100 Agradecimentos", image: "100", reachedDate: null },
        { value: 500, label: "500 Agradecimentos", image: "500", reachedDate: null },
        { value: 1000, label: "1 mil Agradecimentos", image: "1k", reachedDate: null },
        { value: 5000, label: "5 mil Agradecimentos", image: "5k", reachedDate: null },
        { value: 10000, label: "10 mil Agradecimentos", image: "10k", reachedDate: null },
        { value: 25000, label: "25 mil Agradecimentos", image: "25k", reachedDate: null },
        { value: 50000, label: "50 mil Agradecimentos", image: "50k", reachedDate: null },
        { value: 100000, label: "100 mil Agradecimentos", image: "100k", reachedDate: null },
    ]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchAndCalculate = async () => {
            setLoading(true);
            try {
                const counters = await getAllDailyCounters(user.uid);

                // Sort counters by dateKey ascending
                const sortedCounters = [...counters].sort((a, b) => a.dateKey.localeCompare(b.dateKey));

                let runningTotal = 0;
                const milestoneDates: Record<number, string> = {};

                for (const counter of sortedCounters) {
                    runningTotal += counter.value;

                    for (const m of milestones) {
                        if (runningTotal >= m.value && !milestoneDates[m.value]) {
                            // Format dateKey (YYYY-MM-DD) to DD.MM.YYYY
                            const [year, month, day] = counter.dateKey.split("-");
                            milestoneDates[m.value] = `${day}.${month}.${year}`;
                        }
                    }
                }

                setMilestones(prev => prev.map(m => ({
                    ...m,
                    reachedDate: milestoneDates[m.value] || null
                })));
            } catch (error) {
                console.error("Error fetching milestones:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAndCalculate();
    }, [user]);

    return {
        milestones,
        loading
    };
};

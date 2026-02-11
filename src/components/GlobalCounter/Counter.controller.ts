import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import { useAuth } from "../../context/AuthContext";
import { getTodayKey } from "../../service/counterService";

export const useCounterController = () => {
    const { user } = useAuth();
    const [globalCount, setGlobalCount] = useState(0);
    const [userCount, setUserCount] = useState(0);
    const [selectedPhrase, setSelectedPhrase] = useState({ title: "", text: "" });
    const templateValue = 1080000;

    useEffect(() => {
        const globalCounterRef = doc(db, "GlobalCounter", "global_counter");
        const unsubscribe = onSnapshot(globalCounterRef, (snap) => {
            if (snap.exists()) {
                setGlobalCount(snap.data().value + templateValue);
            } else {
                setGlobalCount(999999999);
            }
        }, (error) => {
            console.error("Error listening to global counter:", error);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) return;
        const todayKey = getTodayKey();
        const userCounterRef = doc(db, "users", user.uid, "dailyCounters", todayKey);
        const unsubscribe = onSnapshot(userCounterRef, (snap) => {
            if (snap.exists()) {
                setUserCount(snap.data().value);
            } else {
                setUserCount(0);
            }
        }, (error) => {
            console.error("Error listening to user counter:", error);
        });
        return () => unsubscribe();
    }, [user]);

    const phraseOptions = [
        {
            title: "🌎 Corrente de Energia",
            text: "O Agradecimento é energia. Aqui, ela se soma, se espalha e se multiplica, transformando o mundo em 'Muagra' de cada vez."
        },
        {
            title: "🪶 Essência Universal",
            text: "Cada clique é um lembrete de que o mundo ainda sabe agradecer. Juntos, somos a soma invisível do bem em movimento."
        },
        {
            title: "💫 Frequência Global",
            text: "Este número não mede agradecimentos, mede a vibração coletiva de milhões que se lembraram de ser muito agradecidos."
        },
        {
            title: "🔥 Chamado à Consciência",
            text: "Não é sobre contar cliques. É sobre despertar consciências. O Muagrômetro Global é a prova viva de que o simples Agradecer ainda move o mundo."
        }
    ];

    useEffect(() => {
        const random = Math.floor(Math.random() * phraseOptions.length);
        setSelectedPhrase(phraseOptions[random]);
    }, []);

    return {
        globalCount,
        userCount,
        selectedPhrase
    };
};

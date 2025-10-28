import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../firebase/config";

export const useConterController = () => {

    const [globalCount, setGlobalCount] = useState(0);
    const templateValue = 1080000


    useEffect(() => {

        const globalCounterRef = doc(db, "GlobalCounter", "global_counter");

        const unsubcribe = onSnapshot(globalCounterRef, (snap) => {
            if (snap.exists()) {
                setGlobalCount(snap.data().value + templateValue)
            } else {
                setGlobalCount(0o0000000000000000000000000000)
            }
        })
        return () => unsubcribe();
    }, [])
    return {
        globalCount
    }
}
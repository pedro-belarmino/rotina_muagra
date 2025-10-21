import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth"
import { auth, db } from "../firebase/config";
import { doc, setDoc, Timestamp, getDoc } from "firebase/firestore";

type AuthContextType = {
    user: User | null;
    loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {

                const userRef = doc(db, "users", currentUser.uid);
                const snapshot = await getDoc(userRef);


                if (!snapshot.exists()) {
                    await setDoc(userRef, {
                        uid: currentUser.uid,
                        displayName: currentUser.displayName,
                        email: currentUser.email,
                        photoURL: currentUser.photoURL,
                        createdAt: Timestamp.now(),
                    });
                }

                setUser(currentUser);
            } else {
                setUser(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

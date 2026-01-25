import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth"
import { auth, db } from "../firebase/config";
import { doc, setDoc, Timestamp, getDoc } from "firebase/firestore";
import { isEmailAuthorized } from "../service/authorizedEmailService";

type AuthContextType = {
    user: User | null;
    loading: boolean;
    isAuthorized: boolean;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    isAuthorized: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser && currentUser.email) {
                const authorized = await isEmailAuthorized(currentUser.email);
                setIsAuthorized(authorized);

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
                setIsAuthorized(false);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, isAuthorized }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

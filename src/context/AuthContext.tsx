import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth"
import { auth, db } from "../firebase/config";
import { doc, setDoc, Timestamp, getDoc } from "firebase/firestore";
import { isEmailAuthorized, isEmailAuthorizedPartial } from "../service/authorizedEmailService";

type AuthContextType = {
    user: User | null;
    loading: boolean;
    isAuthorized: boolean;
    isAuthorizedPartial: boolean;
    showWelcomeModal: boolean;
    markWelcomeModalAsSeen: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    isAuthorized: false,
    isAuthorizedPartial: false,
    showWelcomeModal: false,
    markWelcomeModalAsSeen: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isAuthorizedPartial, setIsAuthorizedPartial] = useState(false);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const [loading, setLoading] = useState(true);

    const markWelcomeModalAsSeen = async () => {
        if (user) {
            const userRef = doc(db, "users", user.uid);
            await setDoc(userRef, { hasSeenWelcomeModal: true }, { merge: true });
            setShowWelcomeModal(false);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser && currentUser.email) {
                const [authorized, authorizedPartial] = await Promise.all([
                    isEmailAuthorized(currentUser.email),
                    isEmailAuthorizedPartial(currentUser.email)
                ]);

                setIsAuthorized(authorized);
                setIsAuthorizedPartial(authorizedPartial);

                const userRef = doc(db, "users", currentUser.uid);
                const snapshot = await getDoc(userRef);

                if (!snapshot.exists()) {
                    await setDoc(userRef, {
                        uid: currentUser.uid,
                        displayName: currentUser.displayName,
                        email: currentUser.email,
                        photoURL: currentUser.photoURL,
                        createdAt: Timestamp.now(),
                        hasSeenWelcomeModal: false,
                    });

                    if (!authorized && !authorizedPartial) {
                        setShowWelcomeModal(true);
                    }
                } else {
                    const userData = snapshot.data();
                    if (!authorized && !authorizedPartial && userData.hasSeenWelcomeModal === false) {
                        setShowWelcomeModal(true);
                    }
                }

                setUser(currentUser);
            } else {
                setUser(null);
                setIsAuthorized(false);
                setIsAuthorizedPartial(false);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            isAuthorized,
            isAuthorizedPartial,
            showWelcomeModal,
            markWelcomeModalAsSeen
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

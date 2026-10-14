import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth"
import { auth, db } from "../firebase/config";
import { doc, setDoc, Timestamp, getDoc } from "firebase/firestore";
import { isEmailAuthorized, isEmailAuthorizedPartial } from "../service/authorizedEmailService";
import { updateUserPhoneNumber } from "../service/userService";
import { isValidE164 } from "../utils/phone";

type AuthContextType = {
    user: User | null;
    loading: boolean;
    isAuthorized: boolean;
    isAuthorizedPartial: boolean;
    showWelcomeModal: boolean;
    markWelcomeModalAsSeen: () => Promise<void>;
    needsPhoneNumber: boolean;
    savePhoneNumber: (phoneNumber: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    isAuthorized: false,
    isAuthorizedPartial: false,
    showWelcomeModal: false,
    markWelcomeModalAsSeen: async () => { },
    needsPhoneNumber: false,
    savePhoneNumber: async () => { },
});

// Resultado da verificação de telefone, amarrado ao uid que foi verificado:
// impede que o estado de um usuário anterior vaze após logout/troca de conta.
type PhoneCheck = { uid: string; needsPhoneNumber: boolean };

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isAuthorizedPartial, setIsAuthorizedPartial] = useState(false);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [phoneCheck, setPhoneCheck] = useState<PhoneCheck | null>(null);

    const markWelcomeModalAsSeen = async () => {
        if (user) {
            const userRef = doc(db, "users", user.uid);
            await setDoc(userRef, { hasSeenWelcomeModal: true }, { merge: true });
            setShowWelcomeModal(false);
        }
    };

    const savePhoneNumber = async (phoneNumber: string) => {
        if (!user) {
            throw new Error("Usuário não autenticado.");
        }
        const uid = user.uid;
        await updateUserPhoneNumber(uid, phoneNumber);
        setPhoneCheck(prev => (prev?.uid === uid ? { uid, needsPhoneNumber: false } : prev));
    };

    const needsPhoneNumber = !!user && phoneCheck?.uid === user.uid && phoneCheck.needsPhoneNumber;

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            // Descarta o resultado anterior até a nova verificação concluir.
            setPhoneCheck(null);
            try {
                if (currentUser && currentUser.email) {
                    let authorized = false;
                    let authorizedPartial = false;

                    try {
                        const [authResult, authPartialResult] = await Promise.all([
                            isEmailAuthorized(currentUser.email),
                            isEmailAuthorizedPartial(currentUser.email)
                        ]);
                        authorized = authResult;
                        authorizedPartial = authPartialResult;
                    } catch (error) {
                        console.error("Error checking email authorization:", error);
                    }

                    setIsAuthorized(authorized);
                    setIsAuthorizedPartial(authorizedPartial);

                    try {
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
                            setPhoneCheck({ uid: currentUser.uid, needsPhoneNumber: true });
                        } else {
                            const userData = snapshot.data();
                            if (!authorized && !authorizedPartial && userData.hasSeenWelcomeModal === false) {
                                setShowWelcomeModal(true);
                            }
                            setPhoneCheck({ uid: currentUser.uid, needsPhoneNumber: !isValidE164(userData.phoneNumber) });
                        }
                    } catch (error) {
                        console.error("Error updating or retrieving user document in AuthContext:", error);
                    }

                    setUser(currentUser);
                } else {
                    setUser(null);
                    setIsAuthorized(false);
                    setIsAuthorizedPartial(false);
                }
            } catch (error) {
                console.error("Critical error in onAuthStateChanged hook:", error);
            } finally {
                setLoading(false);
            }
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
            markWelcomeModalAsSeen,
            needsPhoneNumber,
            savePhoneNumber
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

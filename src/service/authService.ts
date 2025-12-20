import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut as firebaseSignOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    setPersistence,
    browserLocalPersistence,
    User,
} from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";

// --- Funções de Autenticação ---

/**
 * Realiza o login com a conta do Google.
 */
export const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await setPersistence(auth, browserLocalPersistence);
    const userCredential = await signInWithPopup(auth, provider);
    await ensureUserExists(userCredential.user);
    return userCredential;
};

/**
 * Realiza o login com e-mail e senha.
 */
export const signInWithEmail = async (email, password) => {
    await setPersistence(auth, browserLocalPersistence);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await ensureUserExists(userCredential.user);
    return userCredential;
};

/**
 * Cria um novo usuário com e-mail e senha.
 */
export const createUserWithEmail = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await ensureUserExists(userCredential.user, {
        displayName: email.split('@')[0], // Nome de usuário padrão
    });
    return userCredential;
};


/**
 * Realiza o logout do usuário.
 */
export const signOut = async () => {
    await firebaseSignOut(auth);
};

// --- Funções de Apoio ---

/**
 * Garante que o usuário tenha um documento correspondente no Firestore.
 * Se não existir, cria um novo.
 * @param {User} user - O objeto de usuário do Firebase Auth.
 * @param {object} additionalData - Dados adicionais para mesclar com os dados do usuário.
 */
export const ensureUserExists = async (user, additionalData = {}) => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
        const userData = {
            uid: user.uid,
            displayName: user.displayName || 'Novo Usuário',
            email: user.email,
            photoURL: user.photoURL,
            createdAt: Timestamp.now(),
            ...additionalData,
        };
        await setDoc(userRef, userData);
    }
};

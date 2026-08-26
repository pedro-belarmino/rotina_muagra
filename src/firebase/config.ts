import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
    apiKey: "AIzaSyB1yvYOmzvgkSdRI6TVwMqrUqtSlxhrdLI",
    authDomain: "muagra-rotina.firebaseapp.com",
    projectId: "muagra-rotina",
    storageBucket: "muagra-rotina.firebasestorage.app",
    messagingSenderId: "1045730750996",
    appId: "1:1045730750996:web:f6e77f1f6a7a2847cfed01",
    measurementId: "G-L4Q4837SZK"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});
export const functions = getFunctions(app);

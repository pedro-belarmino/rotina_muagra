// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";



// import { getAnalytics } from "firebase/analytics";



// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyB1yvYOmzvgkSdRI6TVwMqrUqtSlxhrdLI",
    authDomain: "muagra-rotina.firebaseapp.com",
    projectId: "muagra-rotina",
    storageBucket: "muagra-rotina.firebasestorage.app",
    messagingSenderId: "1045730750996",
    appId: "1:1045730750996:web:f6e77f1f6a7a2847cfed01",
    measurementId: "G-L4Q4837SZK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// const analytics = getAnalytics(app);



export const auth = getAuth(app);
export const db = getFirestore(app);
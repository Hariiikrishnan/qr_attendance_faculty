import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBcY_TV-QbKtPIlxefiwe3R2epbvBqLgZ8",
  authDomain: "qr-attendance-4ce48.firebaseapp.com",
  projectId: "qr-attendance-4ce48",
  storageBucket: "qr-attendance-4ce48.firebasestorage.app",
  messagingSenderId: "912301448814",
  appId: "1:912301448814:web:76a8cb6686c4cc4eac107f",
  measurementId: "G-EWL5S42DTK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

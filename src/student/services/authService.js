// src/services/authService.js

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";

/* ===================== SESSION STORAGE ===================== */

export function saveUserSession(user) {
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("uid", user.uid);
  localStorage.setItem("email", user.email || "");
  localStorage.setItem("photoURL", user.photoURL || "");
}

/* ===================== AUTH SERVICE ===================== */

const auth = getAuth();
const provider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // 🔐 DOMAIN RESTRICTION (same logic as Flutter)
    // Example:
    if (!user.email.endsWith("@sastra.ac.in")) {
      await signOut();
      throw new Error("Only SASTRA email accounts allowed");
    }

    if (!user) {
      await signOut();
      throw new Error("Authentication failed");
    }

    saveUserSession(user);
    return user;
  } catch (error) {
    throw error;
  }
}

export async function signOut() {
  await firebaseSignOut(auth);
  localStorage.clear();
}

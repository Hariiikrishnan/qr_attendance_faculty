import {
  GoogleAuthProvider,
  signInWithPopup,
  deleteUser,
  signOut,
} from "firebase/auth";
import { auth } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import { addFaculty } from "../api/api";

import { useState, useRef } from "react";
import styles from "../layout.module.css";

const provider = new GoogleAuthProvider();

export default function UnifiedLogin() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [facultyID, setFacultyID] = useState("");
  const [firebaseUser, setFirebaseUser] = useState(null);

  // 🔒 Prevent double popup
  const loginInProgress = useRef(false);

  const signIn = async () => {
    if (loginInProgress.current) return;
    loginInProgress.current = true;

    setLoading(true);
    setErrorMsg("");

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const email = user.email || "";

      /* ===================== FACULTY ===================== */
      if (
        email.endsWith("@sastra.edu") ||
        email === "therihari36@gmail.com"
      ) {
        const response = await addFaculty(user);
        const backendUser = response?.data?.data;

        if (
          backendUser?.role === "faculty" &&
          !backendUser?.facultyID
        ) {
          setFirebaseUser(user);
          setShowFacultyModal(true);
          return;
        }

        navigate("/dashboard", { replace: true });
        return;
      }

      /* ===================== STUDENT ===================== */
      if (email.endsWith("@sastra.ac.in")) {
        navigate("/student/home", { replace: true });
        return;
      }

      /* ===================== BLOCK ===================== */
      setErrorMsg(
        "Only official SASTRA faculty or student accounts are allowed."
      );
      await deleteUser(user);
      await signOut(auth);
    } catch (err) {
      console.error("Login error:", err);
      if (auth.currentUser) await signOut(auth);

      setErrorMsg(
        err?.response?.data?.message ||
          "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
      loginInProgress.current = false;
    }
  };

  const submitFacultyID = async () => {
    if (!facultyID.trim()) {
      setErrorMsg("Faculty ID is required");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");

      await addFaculty(firebaseUser, facultyID);
      setShowFacultyModal(false);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to save Faculty ID. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h2 className={styles.title}>QR Attendance System</h2>
        <p className={styles.subTitle}>
          Sign in with your official college Google account
        </p>

        {errorMsg && (
          <div className={styles.errorBox}>{errorMsg}</div>
        )}

        {!showFacultyModal && (
          <button
            className={styles.buttonPrimary}
            onClick={signIn}
            disabled={loading}
          >
            {loading ? (
              <div className={styles.spinner}></div>
            ) : (
              "Sign in with Google"
            )}
          </button>
        )}

        {showFacultyModal && (
          <div style={{ marginTop: 20 }}>
            <h3>Complete Faculty Registration</h3>
            <p>Please enter your Faculty ID</p>

            <input
              type="text"
              placeholder="Faculty ID"
              value={facultyID}
              onChange={(e) => setFacultyID(e.target.value)}
              style={{
                width: "100%",
                padding: 10,
                margin: "10px 0",
              }}
            />

            <button
              className={styles.buttonPrimary}
              onClick={submitFacultyID}
              disabled={loading}
            >
              {loading ? "Saving..." : "Continue"}
            </button>
          </div>
        )}

        <p className={styles.footerNote}>
          Authorized SASTRA users only
        </p>
      </div>
    </div>
  );
}

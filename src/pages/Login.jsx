import {
  GoogleAuthProvider,
  signInWithPopup,
  deleteUser,
  signOut,
} from "firebase/auth";
import { auth } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import { addFaculty } from "../api/api";
import styles from "../layout.module.css";
import { useState, useRef } from "react";

const provider = new GoogleAuthProvider();

function Login() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [facultyID, setFacultyID] = useState("");
  const [firebaseUser, setFirebaseUser] = useState(null);

  // 🔒 Prevent duplicate login attempts
  const loginInProgress = useRef(false);

  const signInWithGoogle = async () => {
    if (loginInProgress.current) return;
    loginInProgress.current = true;

    setErrorMsg("");
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // 🔒 Email restriction
      const allowed =
        user.email?.endsWith("@sastra.edu") ||
        user.email === "therihari36@gmail.com";

      if (!allowed) {
        setErrorMsg("Only official SASTRA email accounts are allowed.");
        await deleteUser(user);
        await signOut(auth);
        return;
      }

      // 📡 Backend sync (safe even if called multiple times)
      const response = await addFaculty(user);
      const backendUser = response?.data?.data;

      if (backendUser?.role === "faculty" && !backendUser?.facultyID) {
        setFirebaseUser(user);
        setShowFacultyModal(true);
        return;
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);

      if (auth.currentUser) {
        await signOut(auth);
      }

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
      navigate("/dashboard");
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
        <h2 className={styles.title}>Faculty Portal for QR Attendance</h2>
        <p className={styles.subTitle}>
          Sign in using your official college email
        </p>

        {errorMsg && (
          <div className={styles.errorBox}>{errorMsg}</div>
        )}

        {!showFacultyModal && (
          <button
            className={`${styles.buttonPrimary} loginBtn`}
            onClick={signInWithGoogle}
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
          <div style={{ marginTop: "20px" }}>
            <h3>Complete Registration</h3>
            <p>Please enter your Faculty ID</p>

            <input
              type="text"
              placeholder="Faculty ID"
              value={facultyID}
              onChange={(e) => setFacultyID(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "10px",
                marginBottom: "10px",
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
          Authorized faculty access only
        </p>
      </div>
    </div>
  );
}

export default Login;

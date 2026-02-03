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
import { useState } from "react";

const provider = new GoogleAuthProvider();

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const signInWithGoogle = async () => {
    if (loading) return;

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

      // 📡 Sync with backend
      const response = await addFaculty(user);
        console.log(response.data.data);
      if (!response?.data?.data?.facultyID) {
        throw new Error(
          response?.data?.data?.message || "Invalid faculty account"
        );
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);

      if (auth.currentUser) {
        await signOut(auth);
      }

      setErrorMsg(
        err?.response?.data?.data?.message ||
          "Login failed. Please try again."
      );
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
          <div className={styles.errorBox}>
            {errorMsg}
          </div>
        )}

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

        <p className={styles.footerNote}>
          Authorized faculty access only
        </p>
      </div>
    </div>
  );
}

export default Login;

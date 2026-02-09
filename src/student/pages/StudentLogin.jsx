import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { AppColors, AppSpacing, AppRadius } from "../../shared/constants";
import { signInWithGoogle } from "../services/authService";

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: AppColors.background,
    padding: AppSpacing.lg,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    textAlign: "center",
  },
  icon: {
    fontSize: 72,
    color: AppColors.accentBlue,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: AppColors.darkText,
    marginTop: AppSpacing.md,
  },
  subtitle: {
    fontSize: 14,
    color: AppColors.mutedText,
    marginTop: AppSpacing.lg,
  },
  button: {
    marginTop: AppSpacing.lg,
    width: "100%",
    height: 48,
    borderRadius: AppRadius.md,
    background: AppColors.accentBlue,
    color: "#fff",
    border: "none",
    fontSize: 16,
    cursor: "pointer",
  },
  note: {
    marginTop: AppSpacing.md,
    fontSize: 12,
    color: AppColors.mutedText,
  },
  error: {
    marginTop: AppSpacing.md,
    background: "#fee2e2",
    color: "#b91c1c",
    padding: 10,
    borderRadius: 6,
    fontSize: 13,
  },
  loader: {
    width: 18,
    height: 18,
    border: "2px solid #fff",
    borderTop: "2px solid transparent",
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin 1s linear infinite",
  },
};



function StudentLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async () => {
    setIsLoading(true);
    setError("");

    try {
      const user = await signInWithGoogle();
      if (!user) return;

      // Navigate to student home
      navigate("/student/home", { replace: true });
    } catch (err) {
      setError(
        err?.message?.replace("Firebase:", "").trim() ||
          "Login failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>📷</div>

        <h1 style={styles.title}>QR Attendance</h1>

        <p style={styles.subtitle}>
          Sign in using your college Google account
        </p>

        <button
          style={{
            ...styles.button,
            opacity: isLoading ? 0.7 : 1,
          }}
          onClick={handleSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <span style={styles.loader} />
          ) : (
            "Sign in with Google"
          )}
        </button>

        <p style={styles.note}>
          Only @sastra.ac.in accounts are allowed
        </p>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentLogin;

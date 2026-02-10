import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AppColors, AppSpacing, AppRadius } from "../../shared/constants";
import { getAllAttended } from "../services/apiService";
import { getCurrentLocation } from "../services/locationService";
import { signOut } from "../services/authService";
const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg,#7E9DD7,#A3CDD9,#BBC9E4)",
    padding: AppSpacing.md,
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: "50%",
  },
  welcome: { fontSize: 13, color: "#333" },
  name: { fontSize: 20, fontWeight: "bold" },
  logout: {
    marginLeft: "auto",
    background: "#fff",
    borderRadius: 20,
    border: "none",
    padding: "6px 12px",
    color: "red",
  },
  section: {
    marginTop: 24,
    fontSize: 18,
    fontWeight: "bold",
  },
  card: {
    marginTop: 12,
    background: "rgba(255,255,255,0.7)",
    padding: 16,
    borderRadius: AppRadius.lg,
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontWeight: "600",
  },
  hours: {
    marginTop: 12,
    display: "flex",
    justifyContent: "space-between",
  },
  hour: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    color: "#fff",
    fontSize: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    position: "fixed",
    bottom: 24,
    left: "50%",
    transform: "translateX(-50%)",
    width: 72,
    height: 72,
    borderRadius: "50%",
    background: AppColors.accentBlue,
    color: "#fff",
    border: "3px solid white",
    fontSize: 28,
  },
  error: {
    marginTop: 12,
    background: "#fee2e2",
    padding: 10,
    borderRadius: 8,
    color: "#991b1b",
  },
};


export default function StudentHome({ user }) {
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState([]);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const regNo = user.email.substring(0, 9);

  useEffect(() => {
    fetchAttendance();
  }, []);

  /* ===================== API ===================== */

  const fetchAttendance = async () => {
    setLoading(true);
    const res = await getAllAttended({ regNo });
    setAttendance(res.success ? res.data : []);
    setLoading(false);
    // console.log(res.data);
  };

  /* ===================== LOCATION + SCAN ===================== */

  const prepareLocationAndScan = async () => {
    if (gettingLocation) return;
    setGettingLocation(true);
    setError("");

    try {
      const location = await getCurrentLocation();
      navigate("/student/scan", {
        state: { location },
      });
    } catch (err) {
      if (err.code === "LOCATION_PERMISSION_DENIED") {
        setError("Location permission is required");
      } else {
        setError("Unable to get location");
      }
    } finally {
      setGettingLocation(false);
    }
  };

  /* ===================== HELPERS ===================== */

  const formatDate = (date) =>
    `${date.getDate().toString().padStart(2, "0")}/${
      (date.getMonth() + 1).toString().padStart(2, "0")
    }/${date.getFullYear()}`;

  const attendanceMap = () => {
    const map = {};

    attendance.forEach((item) => {
      let date;

      const raw =
        item.startScanTime ||
        item.endScanTime ||
        item.createdAt;

      if (raw) {
        date = new Date(raw);
      } else {
        const match = item.sessionId.match(/_(\d{2})_(\d{2})$/);
        if (!match) return;
        date = new Date(
          new Date().getFullYear(),
          parseInt(match[2]) - 1,
          parseInt(match[1])
        );
      }

      const key = formatDate(date);
      const hourMatch = item.sessionId.match(/H([1-8])/);
      if (!hourMatch) return;

      const hour = parseInt(hourMatch[1]);
      map[key] ??= {};
      map[key][hour] = item.status || "ABSENT";
    });

    return map;
  };

  const map = attendanceMap();

  console.log(map);

  /* ===================== UI ===================== */

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <img
          src={user.photoURL}
          alt="avatar"
          style={styles.avatar}
        />
        <div>
          <div style={styles.welcome}>Welcome back</div>
          <div style={styles.name}>{user.displayName}</div>
        </div>

        <button style={styles.logout} onClick={signOut}>
          Logout
        </button>
      </header>

      {error && <div style={styles.error}>{error}</div>}

      {loading ? (
        <div style={styles.loader}>Loading…</div>
      ) : (
        <>
          <h2 style={styles.section}>Last 10 Days Attendance</h2>

          {Array.from({ length: 10 }).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const key = formatDate(date);
            const dayData = map[key] || {};
            const present = Object.values(dayData).filter(
              (s) => s === "PRESENT"
            ).length;

            return (
              <div key={key} style={styles.card}>
                <div style={styles.cardHeader}>
                  <span>{key}</span>
                  <span>{present}/8</span>
                </div>

                <div style={styles.hours}>
                  {Array.from({ length: 8 }).map((_, h) => {
                    const status = dayData[h + 1];
                    const color =
                      status === "PRESENT"
                        ? "green"
                        : status === "ABSENT"
                        ? "red"
                        : "gray";

                    return (
                      <div
                        key={h}
                        style={{
                          ...styles.hour,
                          background: color,
                        }}
                      >
                        H{h + 1}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </>
      )}

      <button
        style={styles.fab}
        onClick={prepareLocationAndScan}
      >
        {gettingLocation ? "…" : "📷"}
      </button>
    </div>
  );
}

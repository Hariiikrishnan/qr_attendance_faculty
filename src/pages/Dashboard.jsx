import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useFaculty } from "../context/FacultyContext";
import OverviewPanel from "../components/OverviewPanel.jsx";
import ClassByFaculty from "../components/ClassByFaculty.jsx";
import AddClass from "../components/AddClass.jsx";
import Logout from "../components/Lougout";
import "../styles/dashboard.css";
import { useNavigate } from "react-router-dom";
import {
  fetchClassesByFaculty,
  fetchRecentSessions,
} from "../api/api";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { faculty, loading: facultyLoading } = useFaculty();
  const navigate = useNavigate();

  // ✅ NORMALIZE FACULTY ONCE
  const facultyData = faculty?.data;

  const [activeTab, setActiveTab] = useState("overview");

  const [classes, setClasses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");

  /* ================= DATA FETCH (ONCE) ================= */
  useEffect(() => {
    if (!facultyData?.facultyID) return;

    setLoadingData(true);
    setError("");

    Promise.allSettled([
      fetchClassesByFaculty(facultyData.facultyID),
      fetchRecentSessions(facultyData.facultyID),
    ]).then(([classesRes, sessionsRes]) => {

      // ---------- Classes ----------
      if (classesRes.status === "fulfilled") {
        const raw = classesRes.value?.data;
        const normalizedClasses = Array.isArray(raw)
        ? raw
        : raw?.data || [];
        
        setClasses(normalizedClasses);
      }
      else {
        setError(
          classesRes.reason?.message || "Failed to load classes"
        );
      }
      
      // ---------- Sessions ----------
      if (sessionsRes.status === "fulfilled") {
        console.log(sessionsRes.value?.data.data);
        setSessions(sessionsRes.value?.data?.data || []);
      } else {
        setError(
          (prev) =>
            prev ||
            sessionsRes.reason?.message ||
            "Failed to load sessions"
        );
      }

      setLoadingData(false);
    });
  }, [facultyData?.facultyID]);

  /* ================= GUARDS ================= */
  if (authLoading || facultyLoading || loadingData) {
    return <div className="centered">Loading dashboard…</div>;
  }

  if (!user || !facultyData) {
    return <div className="centered">Unauthorized access</div>;
  }

  /* ================= UI ================= */
  return (
    <div className="dashboard-root">
      {/* ===== Sidebar ===== */}
      <aside className="sidebar">
        <h2 className="brand">Faculty Portal</h2>

        {/* 🔥 PRIMARY ACTION */}
        <button
          className="create-session-btn"
          disabled={classes.length === 0}
          onClick={() =>
            navigate("/dashboard/session", {
              state: { classes },
            })
          }
        >
          ➕ Create Session
        </button>

        <nav>
          <button
            className={activeTab === "overview" ? "active" : ""}
            onClick={() => setActiveTab("overview")}
          >
            📊 Overview
          </button>

          <button
            className={activeTab === "classes" ? "active" : ""}
            onClick={() => setActiveTab("classes")}
          >
            🏫 Classes
          </button>

          <button
            className={activeTab === "add" ? "active" : ""}
            onClick={() => setActiveTab("add")}
          >
            ➕ Add Class
          </button>
        </nav>

        <Logout />
      </aside>

      {/* ===== Main Content ===== */}
      <main className="dashboard-content">
        {error && <p className="info">{error}</p>}

        {activeTab === "overview" && (
          <OverviewPanel
            faculty={facultyData}
            user={user}
            sessions={sessions}
            classes={classes}
          />
        )}

        {activeTab === "classes" && (
          <ClassByFaculty classes={classes} />
        )}

        {activeTab === "add" && (
          <AddClass
            faculty={facultyData}
            user={user}
            onClassAdded={(newClass) =>
              setClasses((prev) => [...prev, newClass])
            }
          />
        )}
      </main>
    </div>
  );
}

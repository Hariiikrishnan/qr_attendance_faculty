import { useState } from "react";
import api from "../../api/api";
import QRDisplay from "../components/QRDisplay";
import FullscreenQR from "../components/FullscreenQR.jsx";
import { useAuth } from "../../context/AuthContext";
import { useFaculty } from "../../context/FacultyContext";
import { useNavigate, useLocation } from "react-router-dom";

/* ===================== AUDIS ===================== */
const AUDIS = [
  { id: "A", name: "SoC", lat: 10.7288577, lng: 79.020521 },
  { id: "B", name: "LTC", lat: 10.7279398, lng: 79.0202228 },
  { id: "C", name: "TIFAC", lat: 10.7289024, lng: 79.0199675 },
  { id: "D", name: "KRC", lat: 10.7285683, lng: 79.0203898 },
  { id: "Z", name: "HOME", lat: 10.768724, lng: 79.1025933 },
  { id: "F", name: "DD", lat: 11.1282620, lng: 77.3474270 },
];

export default function Session() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, loading: authLoading } = useAuth();
  const { faculty, loading: facultyLoading } = useFaculty();
  const facultyData = faculty?.data;

  const passedClasses = Array.isArray(location.state?.classes)
    ? location.state.classes
    : [];

  const [classes] = useState(passedClasses);

  /* ===================== SESSION TYPE ===================== */
  const [sessionType, setSessionType] = useState("class"); // class | audi

  /* ===================== FORM STATE ===================== */
  const [selectedClass, setSelectedClass] = useState(
    passedClasses[0]?.classId || ""
  );
  const [selectedAudi, setSelectedAudi] = useState(AUDIS[0].id);
  const [hourNumber, setHourNumber] = useState(1);
  const [qrExpiry, setQrExpiry] = useState(10);

  /* ===================== SESSION STATE ===================== */
  const [session, setSession] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* ===================== GUARDS ===================== */
  if (authLoading || facultyLoading) {
    return <div className="centered">Loading session…</div>;
  }

  if (!user || !facultyData) {
    return <div className="centered">Unauthorized</div>;
  }

  /* ===================== START SESSION ===================== */
  const startSession = async () => {
    const audi = AUDIS.find((a) => a.id === selectedAudi);
    if (!audi) {
      setMessage("Invalid auditorium selection");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const payload = {
        facultyId: facultyData.facultyID,
        blockName: audi.name,
        location: {
          lat: audi.lat,
          lng: audi.lng,
        },
        isAudi: sessionType === "audi",
      };

      if (sessionType === "class") {
        const classObj = classes.find((c) => c.classId === selectedClass);
        if (!classObj) {
          setMessage("Please select a class");
          return;
        }

        payload.classId = selectedClass;
        payload.className = classObj.className;
        payload.hourNumber = hourNumber;
      }

      const res = await api.post("/faculty/session/start", payload);
      setSession(res.data.data);
    } catch (err) {
      setMessage(err.message || "Failed to create session");
    } finally {
      setLoading(false);
    }
  };

  /* ===================== QR ===================== */
  const showQR = async (type) => {
    if (!session) return;

    try {
      setLoading(true);
      setMessage("");

      const res = await api.post("/faculty/session/qr", {
        sessionId: session.sessionId,
        qrExpirySeconds: qrExpiry,
        type,
      });

      setQrData(res.data.data);
    } catch (err) {
      setMessage(err.message || "Failed to generate QR");
    } finally {
      setLoading(false);
    }
  };

  const closeSession = async () => {
    if (!session) return;

    try {
      setLoading(true);
      await api.post("/faculty/session/close", {
        sessionId: session.sessionId,
      });
      navigate("/dashboard");
    } catch (err) {
      setMessage(err.message || "Failed to close session");
    } finally {
      setLoading(false);
    }
  };

  /* ===================== UI ===================== */
  return (
    <div className="session-page">
      <div className="session-header">
        <h2 className="session-title">Create Session</h2>
      </div>

      {message && <p className="info">{message}</p>}

      {!session && (
        <div className="control-panel">

          {/* ===== PROFESSIONAL SEGMENTED SWITCH ===== */}
          <div className="segmented-control">
            <div
              className={`segment-slider ${
                sessionType === "audi" ? "right" : "left"
              }`}
            />

            <button
              className={`segment-btn ${
                sessionType === "class" ? "active" : ""
              }`}
              onClick={() => setSessionType("class")}
            >
              📚 Class Session
            </button>

            <button
              className={`segment-btn ${
                sessionType === "audi" ? "active" : ""
              }`}
              onClick={() => setSessionType("audi")}
            >
              🎤 Auditorium Session
            </button>
          </div>

          {/* ===== CLASS FORM ===== */}
          {sessionType === "class" && (
            <>
              <label>Select Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                {classes.map((c) => (
                  <option key={c.classId} value={c.classId}>
                    {c.className}
                  </option>
                ))}
              </select>

              <label>Hour Number</label>
              <select
                value={hourNumber}
                onChange={(e) => setHourNumber(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((h) => (
                  <option key={h} value={h}>
                    Hour {h}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* ===== COMMON AUDITORIUM SELECT ===== */}
          <label>Select Auditorium</label>
          <select
            value={selectedAudi}
            onChange={(e) => setSelectedAudi(e.target.value)}
          >
            {AUDIS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          <label>
            QR Expiry: <strong>{qrExpiry}s</strong>
          </label>
          <input
            type="range"
            min="10"
            max="60"
            step="5"
            value={qrExpiry}
            onChange={(e) => setQrExpiry(Number(e.target.value))}
          />

          <button
            className="btn-primary"
            onClick={startSession}
            disabled={loading}
          >
            {loading
              ? "Creating…"
              : sessionType === "audi"
              ? "Create Auditorium Session"
              : "Create Class Session"}
          </button>
        </div>
      )}

      {/* ===== ACTIVE SESSION ===== */}
      {session && (
        <>
          <div className="qr-stage">
            {qrData && (
              <FullscreenQR>
                <QRDisplay data={qrData} size={800} />
              </FullscreenQR>
            )}
          </div>

          <div className="bottom-controls">
            <button
              className="btn-primary"
              onClick={() => showQR("S")}
              disabled={loading}
            >
              Show START QR
            </button>

            <button
              className="btn-secondary"
              onClick={() => showQR("E")}
              disabled={loading}
            >
              Show END QR
            </button>

            <button
              className="btn-secondary"
              onClick={() =>
                navigate(`/dashboard/session/${session.sessionId}`)
              }
            >
              View Attendance
            </button>

            <button
              className="btn-danger"
              onClick={closeSession}
              disabled={loading}
            >
              Close Session
            </button>
          </div>
        </>
      )}
    </div>
  );
}
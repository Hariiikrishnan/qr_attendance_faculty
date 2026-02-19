// 10.7289024,79.0199675 - TIFAC Block
// 10.7279398,79.0202228 - LTC Block
// 10.7288577,79.020521  - SoC Block
// 10.7285683,79.0203898 - KRC 
// 10.7686893,79.1032817 - Home


import { useState } from "react";
import api from "../../api/api";
import QRDisplay from "../components/QRDisplay";
import FullscreenQR from "../components/FullscreenQR.jsx";
import { useAuth } from "../../context/AuthContext";
import { useFaculty } from "../../context/FacultyContext";
import { useNavigate, useLocation } from "react-router-dom";

/* ===================== BLOCKS ===================== */
const BLOCKS = [
  { id: "A", name: "SoC", lat: 10.7288577, lng: 79.020521 },
  { id: "B", name: "LTC", lat: 10.7279398, lng: 79.0202228 },
  { id: "C", name: "TIFAC", lat: 10.7289024, lng: 79.0199675 },
  { id: "D", name: "KRC", lat: 10.7285683, lng: 79.0203898 },
  { id: "Z", name: "HOME", lat: 10.768724, lng: 79.1025933 },
  { id: "F", name: "DD", lat: 11.1282620, lng: 77.3474270 },
];
// 10.768724,79.1025933
// 11.1282620, 77.3474270
export default function Session() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, loading: authLoading } = useAuth();
  const { faculty, loading: facultyLoading } = useFaculty();
  const facultyData = faculty?.data;

  /* ===================== STATE ===================== */
  const passedClasses = Array.isArray(location.state?.classes)
    ? location.state.classes
    : [];

  const [classes] = useState(passedClasses);
  const [selectedClass, setSelectedClass] = useState(
    passedClasses[0]?.classId || ""
  );
  const [selectedBlock, setSelectedBlock] = useState(BLOCKS[0].id);
  const [hourNumber, setHourNumber] = useState(1);
  const [qrExpiry, setQrExpiry] = useState(10);

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

  if (!classes.length && !session) {
    return (
      <div className="centered">
        No classes available. Please add a class first.
      </div>
    );
  }


  /* ===================== ACTIONS ===================== */

  const startSession = async () => {
    if (!selectedClass) {
      setMessage("Please select a class");
      return;
    }

    const classObj = classes.find((c) => c.classId === selectedClass);
    const block = BLOCKS.find((b) => b.id === selectedBlock);

    if (!classObj || !block) {
      setMessage("Invalid class or block selection");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await api.post("/faculty/session/start", {
        facultyId: facultyData.facultyID,
        classId: selectedClass,
        className: classObj.className,
        blockName: block.name,
        hourNumber,
        location: {
          lat: block.lat,
          lng: block.lng,
        },
      });

      setSession(res.data);
    } catch (err) {
      setMessage(err.message || "Failed to create session");
    } finally {
      setLoading(false);
    }
  };

  const showQR = async (type) => {
    if (!session) return;

    try {
      setLoading(true);
      setMessage("");


      const res = await api.post("/faculty/session/qr", {
        sessionId: session.data.sessionId,
        qrExpirySeconds: qrExpiry,
        type,
      });
      console.log(res);

      setQrData(res.data);

      console.log("QR LENGTH:", JSON.stringify(qrData.data).length);
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
        sessionId: session.data.sessionId,
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
        <h2 className="session-title">Session Control</h2>
      </div>

      {message && <p className="info">{message}</p>}

      {/* ========== CREATE SESSION ========== */}
      {!session && (
        <div className="control-panel">
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

          <label>Select Block</label>
          <select
            value={selectedBlock}
            onChange={(e) => setSelectedBlock(e.target.value)}
          >
            {BLOCKS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
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
            {loading ? "Creating…" : "Create Session"}
          </button>
        </div>
      )}

      {/* ========== ACTIVE SESSION ========== */}
      {session && (
        <>
          <div className="qr-stage">
            {/* {qrData && (
              <div className="qr-wrapper">
                <div className="qr-title">
                  Scan to mark attendance
                </div>
                <QRDisplay data={qrData} />
                <div className="qr-hint">
                  Do not refresh until instructed
                </div>
              </div>
            )} */}

              {qrData && (
                <FullscreenQR>
                  <QRDisplay data={qrData.data} size={800} />
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

import { useEffect, useState } from "react";
import api from "../../api/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";

export default function SessionDetails() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [originalStudents, setOriginalStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [message, setMessage] = useState("");

  const presentCount = students.filter(
    (s) => s.status === "PRESENT"
  ).length;

  useEffect(() => {
    api
      .get(`/user/session/${sessionId}/attendance/full`)
      .then((res) => {
        const data = res.data?.data || [];
        setStudents(data);
        setOriginalStudents(JSON.parse(JSON.stringify(data)));
      })
      .catch(() => setMessage("Failed to load attendance"))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const handleStatusChange = (index, status) => {
    setStudents((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], status };

      setHasChanges(
        JSON.stringify(updated) !==
          JSON.stringify(originalStudents)
      );
      return updated;
    });
  };

  const saveAttendance = async () => {
    try {
      const originalMap = {};
      originalStudents.forEach(
        (s) => (originalMap[s.studentId] = s.status)
      );

      const modified = students.filter(
        (s) =>
          s.studentId &&
          originalMap[s.studentId] !== s.status
      );

      if (!modified.length) {
        setMessage("No changes to save");
        return;
      }

      await api.put(
        `/faculty/session/${sessionId}/attendance`,
        {
          attendance: modified.map((s) => ({
            sessionId,
            studentId: s.studentId,
            status: s.status,
          })),
        }
      );

      setOriginalStudents(JSON.parse(JSON.stringify(students)));
      setIsEditing(false);
      setHasChanges(false);
      setMessage("Attendance saved successfully");
    } catch {
      setMessage("Failed to save attendance");
    }
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      students.map((s, i) => ({
        "S.No": i + 1,
        "Reg No": s.studentId,
        Status: s.status,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Attendance"
    );

    const buffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([buffer]),
      `${sessionId}_attendance.xlsx`
    );
  };

  if (loading) {
    return <div className="centered">Loading session…</div>;
  }

  return (
    <div className="session-review">
      {/* ===== HEADER ===== */}
      <header className="session-review-header">
        <div>
          <h2>Attendance Review</h2>
          <p className="">Session ID: {sessionId}</p>
        </div>

        <div className="kpi-bar">
          <div>
            <strong>{students.length}</strong>
            <span>Total</span>
          </div>
          <div>
            <strong>{presentCount}</strong>
            <span>Present</span>
          </div>
          <div>
            <strong>{students.length - presentCount}</strong>
            <span>Absent</span>
          </div>
        </div>
      </header>

      {/* ===== TOOLBAR ===== */}
      <div className="session-toolbar">
        <div className="left">
          <button
            className="btn-secondary"
            onClick={() => navigate("/dashboard")}
          >
            ← Back
          </button>
        </div>

        <div className="right">
          <button
            className="btn-secondary"
            onClick={downloadExcel}
          >
            Export Excel
          </button>

          {!isEditing && (
            <button
              className="btn-primary"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </button>
          )}

          {isEditing && (
            <>
              <button
                className="btn-primary"
                disabled={!hasChanges}
                onClick={saveAttendance}
              >
                Save
              </button>

              <button
                className="btn-secondary"
                onClick={() => {
                  setStudents(originalStudents);
                  setIsEditing(false);
                  setHasChanges(false);
                }}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {message && <p className="info">{message}</p>}

      {/* ===== SCROLLABLE TABLE ONLY ===== */}
      <div className="table-shell scrollable">
        <table className="attendance-table dense">
          <thead>
            <tr>
              <th>#</th>
              <th>Register No</th>
              <th>Name</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {students.map((s, i) => (
              <tr key={s.studentId || i}>
                <td>{i + 1}</td>
                <td>{s.studentId}</td>
                <td>{s.name}</td>
                <td>
                  {!isEditing ? (
                    <span
                      className={`badge ${
                        s.status === "PRESENT"
                          ? "green"
                          : "red"
                      }`}
                    >
                      {s.status}
                    </span>
                  ) : (
                   <div className="attendance-switch">
  <button
    className={
      s.status === "PRESENT"
        ? "switch-btn active present"
        : "switch-btn"
    }
    onClick={() => handleStatusChange(i, "PRESENT")}
  >
    Present
  </button>

  <button
    className={
      s.status === "ABSENT"
        ? "switch-btn active absent"
        : "switch-btn"
    }
    onClick={() => handleStatusChange(i, "ABSENT")}
  >
    Absent
  </button>
</div>

                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchClassDetails } from "../api/api";
import Loader from "../components/Loader";
import "../styles/dashboard.css";

export default function ClassDetails() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [cls, setCls] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClassDetails(classId)
      .then((res) => setCls(res.data.data))
      .finally(() => setLoading(false));
  }, [classId]);

  if (loading) return <Loader text="Loading class details…" />;
  if (!cls) return <div className="card">Class not found</div>;

  return (
    <div className="class-details-page">
      {/* ===== HEADER ===== */}
      <div className="class-header">
        <div>
          <h2>{cls.className}</h2>
          <p >
            Class ID: <strong>{cls.classId}</strong>
          </p>
        </div>

        <button
          className="btn-secondary"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
      </div>

      {/* ===== STATS ===== */}
      <div className="class-stats">
        <div className="stat-card">
          <span>Total Students</span>
          <strong>{cls.totalStudents}</strong>
        </div>

        <div className="stat-card">
          <span>Faculty</span>
          <strong>{cls.facultyNames.join(", ")}</strong>
        </div>
      </div>

      {/* ===== STUDENT LIST ===== */}
      <div className="card student-table-card">
        <h3>Student List</h3>

        <div className="table-shell scrollable">
          <table className="attendance-table dense">
            <thead>
              <tr>
                <th>#</th>
                {Object.keys(cls.students[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {cls.students.map((s, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  {Object.values(s).map((v, j) => (
                    <td key={j}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

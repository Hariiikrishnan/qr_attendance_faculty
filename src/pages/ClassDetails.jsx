import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchClassDetails } from "../api/api";
import Loader from "../components/Loader";
import "../styles/dashboard.css";

export default function ClassDetails() {
  const { classId } = useParams();
  const [cls, setCls] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClassDetails(classId)
      .then(res => setCls(res.data))
      .finally(() => setLoading(false));
  }, [classId]);

  if (loading) return <Loader text="Loading class details..." />;
  if (!cls) return <p className="card">Class not found</p>;

  return (
    <div className="dashboard-container">
      <div className="card">
        <h2>{cls.className}</h2>
        <p><strong>Total Students:</strong> {cls.totalStudents}</p>
        <p><strong>Faculty:</strong> {cls.facultyNames.join(", ")}</p>
      </div>

      <h3>Students</h3>

      <div className="card" style={{ overflowX: "auto" }}>
        <table width="100%">
          <thead>
            <tr>
              {Object.keys(cls.students[0]).map((key) => (
                <th key={key} align="left">{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cls.students.map((s, i) => (
              <tr key={i}>
                {Object.values(s).map((v, j) => (
                  <td key={j}>{v}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useNavigate } from "react-router-dom";

export default function ClassByFaculty({ classes }) {
  const navigate = useNavigate();

  if (!classes.length) {
    return <div className="card">No classes found</div>;
  }

  return (
    <>
      <h1>Your Classes</h1>

      <div className="grid class-grid">
        {classes.map((c) => (
          <div
            key={c.classId}
            className="card class-card"
            onClick={() =>
              navigate(`/dashboard/class/${c.classId}`)
            }
          >
            <h3>{c.className}</h3>
            <p>Total Students: {c.totalStudents}</p>
          </div>
        ))}
      </div>
    </>
  );
}

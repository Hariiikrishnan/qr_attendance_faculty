import { useState } from "react";
import { addClass } from "../api/api";

const DEPARTMENTS = ["CSE", "ECE", "EEE", "MECH", "CIVIL","MCA"];
const YEARS = ["1", "2", "3", "4"];
const SECTIONS = ["A", "B", "C", "D","E","F","G","I","J","K","L","M","N"];

export default function AddClass({ faculty, user, onClassAdded }) {
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const className =
    department && year && section
      ? `${department}_${year}_${section}`
      : "";

  const submit = async () => {
    if (!className || !file) {
      setMessage("Please select all fields and upload Excel");
      return;
    }

    const formData = new FormData();
    formData.append("className", className);
    formData.append("facultyId", faculty.facultyID);
    formData.append("facultyName", user.email);
    formData.append("file", file);

    try {
      setLoading(true);
      setMessage("");
      const res = await addClass(formData);

      onClassAdded?.({
        classId: res.data?.classId || Date.now(),
        className,
        totalStudents: 0,
      });

      setMessage(`Class ${className} added successfully`);
      setDepartment("");
      setYear("");
      setSection("");
      setFile(null);
    } catch (err) {
      setMessage(err.message || "Failed to add class");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card narrow">
      <h2>Create Class</h2>

      {message && <p className="info">{message}</p>}

      <select value={department} onChange={(e) => setDepartment(e.target.value)}>
        <option value="">Select Department</option>
        {DEPARTMENTS.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      <select value={year} onChange={(e) => setYear(e.target.value)}>
        <option value="">Select Year</option>
        {YEARS.map((y) => (
          <option key={y} value={y}>Year {y}</option>
        ))}
      </select>

      <select value={section} onChange={(e) => setSection(e.target.value)}>
        <option value="">Select Section</option>
        {SECTIONS.map((s) => (
          <option key={s} value={s}>Section {s}</option>
        ))}
      </select>

      {className && (
        <p className="preview">
          Class Name: <strong>{className}</strong>
        </p>
      )}

      <input
        type="file"
        accept=".xlsx"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={submit} disabled={loading}>
        {loading ? "Creating…" : "Create Class"}
      </button>
    </div>
  );
}

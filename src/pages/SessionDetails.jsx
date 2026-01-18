import { useEffect, useState } from "react";
import api from "../api/api";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";


export default function SessionDetails() {
    const [students, setStudents] = useState([]);
    const [presentStudents, setpresentStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // 🔹 Fetch session details
    const { sessionId } = useParams();
    const { session } = useLocation();

  // 🔹 Fetch attended students
  const fetchpresentStudents = async () => {
    try {
      const res = await api.get(`/faculty/session/${sessionId}/attendance`);
      setStudents(res.data.data);
       const attended = res.data.data.filter(
      student => student.status === "PRESENT"
      );

      setpresentStudents(attended);
     
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchpresentStudents();
      setLoading(false);
    };
    load();
  }, [sessionId]);

  // 📊 Download Excel
  const downloadExcel = () => {
    const worksheetData = students.map((s, index) => ({
      "S.No": index + 1,
      "Regno": s.studentId,
      "Status":s.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(file, `${sessionId}_attendance.xlsx`);
  };

  if (loading) return <p>Loading session...</p>;

  return (
    <div>
      <h2>Session Details</h2>

      {/* 🔹 Session Info */}
      <div>
        {/* <p><b>Session ID:</b> {sessionId}</p>
        <p><b>Faculty:</b> {session.facultyId}</p>
        <p><b>Auditorium:</b> {session.audi}</p>
        <p><b>Radius:</b> {session.radius} meters</p>
        <p><b>Status:</b> {session.state}</p>
        <p><b>Start Time:</b> {new Date(session.startTime).toLocaleString()}</p>
        <p><b>End Time:</b> {new Date(session.endTime).toLocaleString()}</p>
      */}
      </div>

      <hr />

      {/* 🔹 Attendance */}
      <h3>Total Attended Students : {students.length}</h3>
      <h3>Total Present Students : {presentStudents.length}</h3>

      <button onClick={downloadExcel}>
        Download Attended Students Excel
      </button>


      <table border="1" cellPadding="8" style={{ marginTop: "10px" }}>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Register No</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s, index) => (
            <tr key={s._id}>
              <td>{index + 1}</td>
              <td>{s.studentId}</td>
              <td>{s.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

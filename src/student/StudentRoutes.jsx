import { Routes, Route, Navigate } from "react-router-dom";

import StudentLogin from "./pages/StudentLogin";
import StudentHome from "./pages/StudentHome";
import ScanQR from "./pages/ScanQR";
import SemesterAttendance from "./pages/SemesterAttendance";

import ProtectedRoute from "../shared/ProtectedRoute";
import { useAuth } from "../context/AuthContext";

export default function StudentRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="login" element={<StudentLogin />} />

      {/* Protected */}
      <Route
        path="home"
        element={
          <ProtectedRoute>
            <StudentHome user={user} />
          </ProtectedRoute>
        }
      />

      <Route
        path="scan"
        element={
          <ProtectedRoute>
            <ScanQR user={user} />
          </ProtectedRoute>
        }
      />

      <Route
        path="semester"
        element={
          <ProtectedRoute>
            <SemesterAttendance />
          </ProtectedRoute>
        }
      />

      {/* Default */}
      <Route path="*" element={<Navigate to="home" replace />} />
    </Routes>
  );
}

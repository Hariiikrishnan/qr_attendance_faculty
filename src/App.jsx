import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./faculty/pages/Dashboard";
import Session from "./faculty/pages/Session";
import SessionDetails from "./faculty/pages/SessionDetails";
import ClassDetails from "./faculty/pages/ClassDetails";
import StudentRoutes from "./student/StudentRoutes.jsx";
import ProtectedRoute from "./shared/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { FacultyProvider } from "./context/FacultyContext";
import UnifiedLogin from "./shared/UnifiedLogin";


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FacultyProvider>
          
        <Routes>

          {/* Public */}
      <Route path="/login" element={<UnifiedLogin />} />

          {/* Protected */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/session"
            element={
              <ProtectedRoute>
                <Session  />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/session/:sessionId"
            element={
              <ProtectedRoute>
                <SessionDetails />
              </ProtectedRoute>
            }
          />

          <Route path="/dashboard/class/:classId" 
          element={
            <ProtectedRoute>
            <ClassDetails />
            </ProtectedRoute>
            } />

            {/* Student PWA */}
            <Route path="/student/*" element={<StudentRoutes />} />


          {/* Default */}
          <Route path="*" element={<Navigate to="/dashboard" />} />

        </Routes>
        
        </FacultyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

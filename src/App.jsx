import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Session from "./pages/Session";
import SessionDetails from "./pages/SessionDetails";
import ClassDetails from "./pages/ClassDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { FacultyProvider } from "./context/FacultyContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FacultyProvider>
          
        <Routes>

          {/* Public */}
          <Route path="/login" element={<Login />} />

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


          {/* Default */}
          <Route path="*" element={<Navigate to="/dashboard" />} />

        </Routes>
        
        </FacultyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

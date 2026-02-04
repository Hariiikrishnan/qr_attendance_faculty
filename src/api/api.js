import axios from "axios";

/* -------------------- Axios Instance -------------------- */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  // baseURL: import.meta.env.VITE_API_BASE_URL || "https://qr-attendance-backend-pr5h.onrender.com",
  timeout: 15000,
});

/* -------------------- Response Interceptor -------------------- */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network / CORS / Server down
    if (!error.response) {
      return Promise.reject({
        message: "Unable to connect to server. Please try again.",
      });
    }

    const serverData = error.response.data;

    return Promise.reject({
      status: error.response.status,
      message:
        serverData?.data?.message ||
        serverData?.message ||
        "Something went wrong",
      errorCode: serverData?.errorCode || "UNKNOWN_ERROR",
    });
  }
);

/* -------------------- API Calls -------------------- */

// 🔐 Faculty login sync
export const addFaculty = (user,facultyID = null) =>
  api.post(`/user/addFaculty/${user.uid}`, {
    role: "faculty",
    facultyID , // keep as-is (backend controlled)
    email: user.email,
  });

// 🕒 Recent sessions (Dashboard)
export const fetchRecentSessions = (facultyId) =>
  api.get(`/user/recent`, {
    params: { facultyId },
  });


// 🏫 Classes handled by faculty
export const fetchClassesByFaculty = (facultyId) =>
  api.get(`/user/by-faculty/${facultyId}`);

// ➕ Create / attach class
export const addClass = (formData) =>
  api.post("/user/add-class", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

// 📋 Class details + students
export const fetchClassDetails = (classId) =>
  api.get(`/user/class/${classId}`);

export default api;

// src/services/apiService.js

const BASE_URL = "http://10.250.97.196:3000";
// const BASE_URL = "https://qr-attendance-backend-pr5h.onrender.com";

const HEADERS = {
  "Content-Type": "application/json",
};

/* ===================== SCAN ATTENDANCE ===================== */

export async function markAttendance({
  payload,
  signature,
  lat,
  lng,
  regNo,
}) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(`${BASE_URL}/student/scan`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        payload,
        signature,
        studentId: regNo,
        deviceId: "web", // logical stable id
        location: { lat, lng },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    return await decodeResponse(response);
  } catch (error) {
    if (error.name === "AbortError") {
      return errorResponse(
        "Server timeout. Please try again.",
        "TIMEOUT"
      );
    }

    if (!navigator.onLine) {
      return errorResponse(
        "No internet connection",
        "NO_INTERNET"
      );
    }

    return errorResponse(
      "Something went wrong",
      "UNKNOWN_ERROR"
    );
  }
}

/* ===================== ATTENDANCE HISTORY ===================== */

export async function getAllAttended({ regNo }) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(
      `${BASE_URL}/student/attendance/all/${regNo}`,
      {
        method: "GET",
        headers: HEADERS,
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    return await decodeResponse(response);
  } catch (error) {
    if (error.name === "AbortError") {
      return errorResponse(
        "Server timeout. Please try again.",
        "TIMEOUT"
      );
    }

    if (!navigator.onLine) {
      return errorResponse(
        "No internet connection",
        "NO_INTERNET"
      );
    }

    return errorResponse(
      "Something went wrong",
      "UNKNOWN_ERROR"
    );
  }
}

/* ===================== HELPERS ===================== */

async function decodeResponse(response) {
  let body;

  try {
    body = await response.json();
  } catch {
    return errorResponse(
      "Invalid server response",
      "INVALID_RESPONSE"
    );
  }

  if (response.ok) {
    return body;
  }

  return {
    success: false,
    message: body.message || "Request failed",
    errorCode: body.errorCode || "REQUEST_FAILED",
  };
}

function errorResponse(message, code) {
  return {
    success: false,
    message,
    errorCode: code,
  };
}

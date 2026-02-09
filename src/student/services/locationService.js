// src/services/locationService.js

/* ===================== LOCATION SERVICE ===================== */
/* Web equivalent of Geolocator */

export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    // 1️⃣ Check browser support
    if (!("geolocation" in navigator)) {
      reject({
        code: "GEOLOCATION_NOT_SUPPORTED",
        message: "Geolocation not supported by this browser",
      });
      return;
    }

    // 2️⃣ Check permission state (best-effort)
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((result) => {
          if (result.state === "denied") {
            reject({
              code: "LOCATION_PERMISSION_DENIED",
              message: "Location permission denied",
            });
          }
        })
        .catch(() => {
          // ignore – some browsers (iOS) don't fully support this
        });
    }

    // 3️⃣ Get current position (low power, one-time)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject({
              code: "LOCATION_PERMISSION_DENIED",
              message: "Location permission denied",
            });
            break;

          case error.POSITION_UNAVAILABLE:
            reject({
              code: "LOCATION_UNAVAILABLE",
              message: "Location unavailable",
            });
            break;

          case error.TIMEOUT:
            reject({
              code: "LOCATION_TIMEOUT",
              message: "Location request timed out",
            });
            break;

          default:
            reject({
              code: "LOCATION_ERROR",
              message: "Failed to get location",
            });
        }
      },
      {
        enableHighAccuracy: false, // 🔥 matches LocationAccuracy.low
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });
}

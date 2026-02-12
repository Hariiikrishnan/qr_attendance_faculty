// src/services/locationService.js

/* ===================== LOCATION SERVICE ===================== */
/* Web equivalent of Geolocator */

export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      return reject({
        code: "GEOLOCATION_NOT_SUPPORTED",
        message: "Geolocation not supported",
      });
    }

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
          case 1:
            reject({
              code: "LOCATION_PERMISSION_DENIED",
              message: "Location permission denied",
            });
            break;

          case 2:
            reject({
              code: "LOCATION_UNAVAILABLE",
              message: "Location unavailable",
            });
            break;

          case 3:
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
        enableHighAccuracy: true,   // 🔥 Important for Android
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

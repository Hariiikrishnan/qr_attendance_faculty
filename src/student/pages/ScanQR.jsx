import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate } from "react-router-dom";

import { AppColors, AppSpacing, AppRadius } from "../../shared/constants";
import { markAttendance } from "../services/apiService";
import { getCurrentLocation } from "../services/locationService";

const SCAN_BOX_SIZE = 260;


const styles = {
  page: {
    minHeight: "100vh",
    background: AppColors.background,
    padding: AppSpacing.md,
  },
  scannerWrapper: {
    position: "relative",
    borderRadius: AppRadius.lg,
    overflow: "hidden",
  },
  scanner: {
    width: "100%",
    aspectRatio: "1 / 1",
  },
  loading: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "flex-end",
  },
  modalCard: {
    width: "100%",
    background: "#fff",
    borderRadius: "24px 24px 0 0",
    padding: 24,
    textAlign: "center",
  },
  doneBtn: {
    width: "100%",
    height: 48,
    borderRadius: 14,
    color: "#fff",
    border: "none",
    marginTop: 16,
  },
  backBtn: {
    marginTop: AppSpacing.md,
    background: "none",
    border: "none",
    fontSize: 16,
  },
};




export default function ScanQR({ user }) {
  const scannerRef = useRef(null);
  const qrInstance = useRef(null);

  const [processing, setProcessing] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [result, setResult] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    qrInstance.current = new Html5Qrcode("qr-reader");

    qrInstance.current.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: SCAN_BOX_SIZE,
        disableFlip: true,
      },
      onScanSuccess,
      () => {}
    );

    return () => {
      qrInstance.current?.stop().catch(() => {});
    };
  }, []);

  const onScanSuccess = async (decodedText) => {
    if (hasScanned || processing) return;

    setHasScanned(true);
    setProcessing(true);

    try {
      qrInstance.current.pause();

      const decoded = JSON.parse(decodedText);
      const payload = decoded?.data?.payload;
      const signature = decoded?.data?.signature;

      if (!payload || !signature) {
        throw new Error("Invalid QR content");
      }

      const location = await getCurrentLocation();

      const res = await markAttendance({
        payload,
        signature,
        lat: location.lat,
        lng: location.lng,
        regNo: user.email.substring(0, 9),
      });

      handleResult(res);
    } catch (err) {
      showResult(false, err.message || "Scan failed");
    }
  };

  const handleResult = (res) => {
    if (!res.success) {
      const map = {
        START_ALREADY_MARKED: "Start attendance already marked",
        END_ALREADY_MARKED: "End attendance already marked",
        START_NOT_MARKED: "Please scan START QR first",
        QR_EXPIRED: "QR code has expired",
      };

      showResult(false, map[res.errorCode] || res.message);
    } else {
      showResult(true, res.message || "Attendance recorded");
    }
  };

  const showResult = (success, message) => {
    setResult({ success, message });
    setProcessing(false);
  };

  const resetScan = async () => {
    setResult(null);
    setHasScanned(false);
    setProcessing(false);
    await qrInstance.current.resume();
  };

  return (
    <div style={styles.page}>
      <div style={styles.scannerWrapper}>
        <div id="qr-reader" ref={scannerRef} style={styles.scanner} />

        {processing && <div style={styles.loading}>Processing…</div>}
      </div>

      {result && (
        <div style={styles.modal}>
          <div style={styles.modalCard}>
            <h2>
              {result.success ? "Attendance Recorded" : "Scan Failed"}
            </h2>
            <p>{result.message}</p>

            <button
              style={{
                ...styles.doneBtn,
                background: result.success
                  ? AppColors.accentBlue
                  : "#333",
              }}
              onClick={resetScan}
            >
              Done
            </button>
          </div>
        </div>
      )}

      <button style={styles.backBtn} onClick={() => navigate(-1)}>
        ← Back
      </button>
    </div>
  );
}

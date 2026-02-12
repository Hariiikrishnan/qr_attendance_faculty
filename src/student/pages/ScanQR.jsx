import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useNavigate, useLocation } from "react-router-dom";
import { AppColors } from "../../shared/constants";
import { markAttendance } from "../services/apiService";

const SCAN_BOX_SIZE = 260;

export default function ScanQR({ user }) {
  const navigate = useNavigate();
  const locationHook = useLocation();

  const qrRef = useRef(null);
  const isScannerRunning = useRef(false);
  const isPausedRef = useRef(false);

  const [processing, setProcessing] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [result, setResult] = useState(null);
  const [confirmData, setConfirmData] = useState(null);
  const [zoom, setZoom] = useState(1);

  const locationData = locationHook.state?.location;

  // Redirect if no location
  useEffect(() => {
    if (!locationData) navigate("/student");
  }, [locationData, navigate]);

  // Start Scanner
  useEffect(() => {
    if (!locationData) return;
    if (qrRef.current) return;

    let cancelled = false;

    const startScanner = async () => {
      try {
        const qr = new Html5Qrcode("qr-reader");
        qrRef.current = qr;

        await qr.start(
          { facingMode: "environment" },
          {
            fps: 8,
            qrbox: { width: SCAN_BOX_SIZE, height: SCAN_BOX_SIZE },
            aspectRatio: 1.777,
            disableFlip: false
          },
          onScanSuccess
        );

        if (!cancelled) isScannerRunning.current = true;
      } catch (err) {
        console.error(err);
      }
    };

    startScanner();

    return () => {
      cancelled = true;
      if (qrRef.current && isScannerRunning.current) {
        qrRef.current.stop().catch(() => {});
        qrRef.current = null;
        isScannerRunning.current = false;
      }
    };
  }, [locationData]);

  // Apply Zoom
  useEffect(() => {
    if (!qrRef.current) return;
    try {
      qrRef.current.applyVideoConstraints({
        advanced: [{ zoom }]
      });
    } catch (e) {}
  }, [zoom]);


  //  Stop Scanner
  const stopScanner = async () => {
    console.log("Hi");
  try {
    console.log("Here");
    if (qrRef.current ) {
      console.log("Stopping");
      await qrRef.current.stop();
      console.log("Stopped");
      qrRef.current.clear();
      qrRef.current = null;
      isScannerRunning.current = false;
      isPausedRef.current = false;
    }
  } catch (err) {
    console.log("Stop error:", err);
  }
};

useEffect(() => {
  return () => {
    stopScanner();
  };
}, []);
useEffect(() => {
  const handleVisibility = () => {
    if (document.hidden) {
      stopScanner();
    }
  };

  document.addEventListener("visibilitychange", handleVisibility);

  return () => {
    document.removeEventListener("visibilitychange", handleVisibility);
  };
}, []);


  // Scan Success
  const onScanSuccess = useCallback((decodedText) => {
    if (hasScanned || processing) return;

    setHasScanned(true);

    try {
      if (!isPausedRef.current) {
        isPausedRef.current = true;
        qrRef.current?.pause();
      }

      const decoded = JSON.parse(decodedText);
      const payload = decoded?.data?.payload;
      const signature = decoded?.data?.signature;

      if (!payload || !signature) throw new Error();

      requestAnimationFrame(() => {
        setConfirmData({ payload, signature });
      });

    } catch {
      showResult(false, "Invalid QR Code");
    }
  }, [hasScanned, processing]);

  const confirmAttendance = useCallback(async () => {
    if (!confirmData) return;

    setConfirmData(null);
    setProcessing(true);

    try {
      const res = await markAttendance({
        payload: confirmData.payload,
        signature: confirmData.signature,
        lat: locationData.lat,
        lng: locationData.lng,
        regNo: user.email.substring(0, 9),
      });

      handleResult(res);
    } catch {
      showResult(false, "Server error");
    }
  }, [confirmData, locationData, user]);

  const handleResult = (res) => {
    const success = !!res?.success;
    const message =
      typeof res?.message === "string"
        ? res.message
        : res?.errorCode || "Something went wrong";

    showResult(success, message);
  };

  const showResult = (success, message) => {
    setProcessing(false);
    setResult({ success, message });
  };

  const resetScan = async () => {
    setResult(null);
    setHasScanned(false);
    setProcessing(false);
    isPausedRef.current = false;
    await qrRef.current?.resume().catch(() => {});
  };

  const cancelConfirm = async () => {
    setConfirmData(null);
    setHasScanned(false);
    isPausedRef.current = false;
    qrRef.current?.resume().catch(() => {});
  };

  if (!locationData) return null;

  const cornerStyle = (v, h) => ({
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "#ffffff",
    borderStyle: "solid",
    borderRadius: 8,
    [v]: 0,
    [h]: 0,
    borderWidth:
      v === "top"
        ? h === "left"
          ? "4px 0 0 4px"
          : "4px 4px 0 0"
        : h === "left"
        ? "0 0 4px 4px"
        : "0 4px 4px 0",
  });

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000" }}>
      
      <div id="qr-reader" style={{ width: "100%", height: "100%" }} />

      {/* Static Scan Box Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: SCAN_BOX_SIZE,
            height: SCAN_BOX_SIZE,
            position: "relative",
          }}
        >
          <div style={cornerStyle("top", "left")} />
          <div style={cornerStyle("top", "right")} />
          <div style={cornerStyle("bottom", "left")} />
          <div style={cornerStyle("bottom", "right")} />
        </div>
      </div>

      {/* ZOOM SLIDER */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          width: "100%",
          textAlign: "center",
        }}
      >
        <input
          type="range"
          min="1"
          max="3"
          step="0.1"
          value={zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value))}
        />
      </div>

      {/* CONFIRM MODAL */}
      { confirmData &&  (
        <ModalFade>
          <h2>Confirm Attendance</h2>
          <p>Do you want to mark attendance?</p>
          <div style={{ display: "flex", justifyContent: "space-evenly" }}>
            <button onClick={confirmAttendance}>Confirm</button>
            <button onClick={cancelConfirm}>Cancel</button>
          </div>
        </ModalFade>
      )}
  // backgroundColor:"#e47f7fa3",
            // backgroundColor:"#80d47d",
      {/* RESULT MODAL */}
     
      {result && (
        <ModalFade>
            <div style={{
            width:"80px",
            height:"80px",
            backgroundColor: result.success ? "#80d47d" : "#e47f7fa3",
            borderRadius:"50%",
            display:"flex",
            alignItems:"center",
            justifyContent:"center",

          }}>
            <div style={{
            width:"60px",
            height:"60px",
            backgroundColor:result.success ?"green" : "red",
            borderRadius:"50%",
            display:"flex",
            alignItems:"center",
            justifyContent:"center",

          }}>
              <h2 style={{
                color:"white",
                fontSize:"25px",
                fontStyle:"bold",
              }}> {result.success ? "/" : "X"} </h2>
            </div>
          </div>
          <h2>{result.success ? "Success" : "Failed"}</h2>
          <p>{result.message}</p>
          <button onClick={resetScan}>Done</button>
        </ModalFade>
      )}

      {/* BACK BUTTON (No blur for performance) */}
      <button
        onClick={async() => {
           await stopScanner();
          navigate("/student")
        } 
      }
        style={{
          position: "absolute",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          padding: "12px 28px",
          borderRadius: 30,
          border: "none",
          background: "#ffffff",
          fontSize: 16,
          color: "black",
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 4px 15px rgba(0,0,0,0.3)"
        }}
      >
        Back
      </button>
    </div>
  );
}

function ModalFade({ children }) {
  return (
    <div
      style={{
        position: "absolute",
        // inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position:"absolute",
        bottom:"5px",
        zIndex:"9999",
        width:"100%"
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: 24,
             display: "flex",
             flexDirection:"column",
        alignItems: "center",
        justifyContent: "center",
          borderRadius: 16,
          textAlign: "center",
          width: "80%",
        }}
      >
        {children}
      </div>
    </div>
  );
}

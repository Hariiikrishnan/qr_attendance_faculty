import { useRef, useState, useEffect } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

export default function FullscreenQR({ children }) {
  const ref = useRef(null);
  const [isFull, setIsFull] = useState(false);

  const toggleFull = async () => {
    const el = ref.current;

    if (!document.fullscreenElement) {
      await el.requestFullscreen();
      setIsFull(true);
    } else {
      await document.exitFullscreen();
      setIsFull(false);
    }
  };

  useEffect(() => {
    const handler = () => {
      setIsFull(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        inset: 0,
        background: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height:"88vh",
      }}
    >
      {/* QR Container */}
      <div
        style={{
          width: "92vmin",
          height: "92vmin",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggleFull}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          background: "black",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: 52,
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 100,
        }}
      >
        {isFull ? <Minimize2 size={22} /> : <Maximize2 size={22} />}
      </button>
    </div>
  );
}

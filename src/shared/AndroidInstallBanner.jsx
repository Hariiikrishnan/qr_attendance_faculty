import { useAndroidInstallHelper } from "./useAndroidInstallHelper";
import { X } from "lucide-react";
export default function AndroidInstallBanner() {
  const { show, dismiss } = useAndroidInstallHelper();

  if (!show) return null;

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.text}>
          <div style={{
            display:"flex",
            alignItems:"center",
            justifyContent:"space-between",
          }}>
          <strong>Install this app</strong>
        <button style={styles.close} onClick={dismiss}>
         <X size={18}/>
        </button>
          </div>
          <p>
            Tap <strong>⋮</strong> (top right) and select
            <br />
            <strong>Install app</strong>
          </p>
        </div>

      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    position: "fixed",
    bottom: 120,
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "center",
    zIndex: 9999,
  },
  card: {
    background: "#ffffff",
    borderRadius: 16,
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    boxShadow: "0 6px 24px rgba(0,0,0,0.15)",
    maxWidth: 320,
  },
  text: {
    fontSize: 13,
    color: "#111",
    lineHeight: 1.4,
  },
  close: {
    padding:"5px",
    background: "none",
    color:"black",
    border: "none",
    fontSize: 16,
    cursor: "pointer",
  },
};

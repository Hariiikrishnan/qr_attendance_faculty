import { useIOSInstallHelper } from "./useIOSInstallHelper";

export default function IOSInstallBanner() {
  const { show, dismiss } = useIOSInstallHelper();

  if (!show) return null;

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.text}>
          <strong>Install this app</strong>
          <p>
            Tap <span style={styles.icon}>⎋</span> Share and then
            <br />
            <strong>Add to Home Screen</strong>
          </p>
        </div>

        <button style={styles.close} onClick={dismiss}>
          ✕
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    position: "fixed",
    bottom: 20,
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
  icon: {
    fontSize: 16,
  },
  close: {
    background: "none",
    border: "none",
    fontSize: 16,
    cursor: "pointer",
  },
};

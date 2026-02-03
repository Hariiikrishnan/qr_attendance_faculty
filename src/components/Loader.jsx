export default function Loader({ text = "Loading..." }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div className="loader"></div>
      <p style={{ color: "#666" }}>{text}</p>
    </div>
  );
}

import { QRCodeSVG } from "qrcode.react";

export default function QRDisplay({ data, size = 300 }) {
  if (!data) return null;

  return (
    <QRCodeSVG
      value={JSON.stringify(data)}
      size={size}
      level="H"
      includeMargin={false}   // ❗ remove extra white border
      style={{
        width: "100%",
        height: "100%",
      }}
    />
  );
}

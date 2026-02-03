import { QRCodeSVG } from "qrcode.react";

export default function QRDisplay({ data }) {
  if (!data) return null;

  return (
    <div className="qr-display">
      <div className="qr-frame">
        <QRCodeSVG
          value={JSON.stringify(data)}
          size={260}
          level="H"
          includeMargin={true}
        />
      </div>

      <p className="qr-instruction">
        Scan this QR code
      </p>
    </div>
  );
}

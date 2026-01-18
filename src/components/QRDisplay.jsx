import {QRCodeSVG} from "qrcode.react";

export default function QRDisplay({ data }) {
  return (
    <div  style={{"margin":"25px"}}>
      <h3>Scan This QR</h3>
      <QRCodeSVG
        value={JSON.stringify(data)}
        size={256}
      />
    </div>
  );
}

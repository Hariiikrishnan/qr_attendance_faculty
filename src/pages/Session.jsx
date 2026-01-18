import { useState } from "react";
import api from "../api/api";
import QRDisplay from "../components/QRDisplay";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";


export default function Session({ facultyId }) {
  const [session, setSession] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [audi, setAudi] = useState("SoC_Audi");
  const navigate = useNavigate();

    const { user } = useAuth();
  const fId = user.email;

  const startSession = async () => {
    console.log(fId);
    const res = await api.post("/faculty/session/start", {
      facultyId:fId,
      location: { lat: 10.7801, lng: 78.2912 },
      audi:audi,
    });
    setSession(res.data);
  };

  const showQR = async (type) => {
    const res = await api.post("/faculty/session/qr", {
      sessionId: session.sessionId,
      type,
    });
    setQrData(res.data);
  };

  const closeSession = async () => {
    await api.post("/faculty/session/close", {
      sessionId: session.sessionId
    });
    alert("Session Closed");
     navigate("/dashboard",)
  };

  return (
    <div>
      <h2>Session Control</h2>

      {!session && (
        <div>
  <select onChange={(e)=>{
            setAudi(e.target.value);
            
            console.log(audi);
          }}>
  <option value="SoC_Audi">SoC Auditorium</option>
  <option value="TDC_Audi">TDC Auditorium</option>
</select>
           <br></br>
            <p>Audiorium Name : {audi}</p>
        <button onClick={startSession}>Create Session</button>
        </div>
      )}

      {session && (
        <>
          <p>Session ID: {session.sessionId}</p>

        

          <button onClick={() => showQR("START")}>
            Show START QR
          </button>

          <button onClick={() => showQR("END")}>
            Show END QR
          </button>

          <button onClick={closeSession}>
            Close Session
          </button>
        </>
      )}

      {qrData && <QRDisplay data={qrData} />}
    </div>
  );
}

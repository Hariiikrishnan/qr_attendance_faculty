import { useState, useEffect } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Logout from "../components/Lougout.jsx";



export default function Dashboard({ facultyId }) {

  const { user } = useAuth();
  const fId = user.email;
  


  const [data, setData] = useState([]);
  const [loaded, setLoaded] = useState(false);
  
  const navigate = useNavigate();


  const getConducted = async () => {
    if (!fId) return; //  prevent bad API call

    try {
      const res = await api.get(`/faculty/sessions/all/${fId}`);

      if (res.data.msg === "Success") {
        setData(res.data.data);
        setLoaded(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    
    getConducted();
  }, [fId]); // ✅ re-run when facultyId arrives

  return (
    <div>
      <h2>Faculty Dashboard</h2>

      <h1>Hello {fId}</h1>

      <button onClick={()=> {

        console.log(fId);
        navigate("/session", {
          state: { fId }
        })}
        
      }
        >
        Start New Session
      </button>
      <Logout/>
      <p>Previous Sessions By You</p>

      {!loaded && <p>Loading...</p>}

      {loaded && data.length === 0 && (
        <p>No sessions found</p>
      )}

      {loaded && data.map((d1, index) => (
        <div key={index} className="session-card" onClick={()=>navigate(`/session/${d1.sessionId}`,{state:d1} )}>

          <div>

          <h3>Auditorium : {d1.audi}</h3>
          <h3>Session Id : {d1.sessionId}</h3>
          <h4>Start Time : { new Date(d1.startTime).toLocaleString('en-US',{
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})}</h4>
          <h4>End Time : { new Date(d1.endTime).toLocaleString('en-US',{
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})}</h4>

</div>

<div>
  <div className="session-info" style={{"backgroundColor": d1.state == "CLOSED" ? "green" : d1.state == "START_ACTIVE" ? "yellow" : "orange" }}>
 <p>{d1.state}</p>
    </div>
  </div>
        </div>
      ))}
    </div>
  );
}

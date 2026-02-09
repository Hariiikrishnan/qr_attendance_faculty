import { signOut } from "firebase/auth";

import { useNavigate } from "react-router-dom";
import { auth } from "../../config/firebase";


function Logout(){
    const navigate = useNavigate();

    
    return <>
    <button onClick={async()=>{
        await signOut(auth);
        navigate("/login");
    }}>Sign Out</button>
    </>
}

export default Logout;
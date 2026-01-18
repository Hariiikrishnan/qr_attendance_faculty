import { useState } from "react";


import { GoogleAuthProvider, signInWithPopup , deleteUser} from "firebase/auth";
import { auth } from "../config/firebase";
import { useNavigate } from "react-router-dom";


// export default function Login({ onLogin }) {
//   const [facultyId, setFacultyId] = useState("");

//   return (
//     <div>
//       <h2>Faculty Login</h2>
//       <input
//         placeholder="Faculty ID"
//         value={facultyId}
//         onChange={e => setFacultyId(e.target.value)}
//       />
//       <button onClick={() => onLogin(facultyId)}>
//         Login
//       </button>
//     </div>
//   );
// }


const provider = new GoogleAuthProvider();

function Login() {

  const navigate = useNavigate();


  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;


      if (!user.email.endsWith("@sastra.edu") && user.email != "therihari36@gmail.com") {
        alert("Only college email allowed");
     // 🔥 DELETE USER from Firebase Auth
        await deleteUser(user);

        // 🚪 Sign out
        await signOut(auth);

  }


      console.log("User:", {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photo: user.photoURL,
      });
    
      var id = user.email;
      navigate("/dashboard",{
        state:{ id }
      });


      
    } catch (err) {
      console.error(err);
    }
  };

  return <button onClick={signInWithGoogle}>Sign in with Google</button>;
}

export default Login;

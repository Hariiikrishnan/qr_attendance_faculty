import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { addFaculty } from "../api/api";


const FacultyContext = createContext();

export function FacultyProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setFaculty(null);
      setLoading(false);
      return;
    }

    const fetchFaculty = async () => {
      try {
        const res = await addFaculty(user);

        setFaculty(res.data); 
        /*
          expected:
          {
            facultyID: 123,
            name: "...",
            role: "faculty"
          }
        */
      } catch (err) {
        console.error(err);
        setFaculty(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFaculty();
  }, [user, authLoading]);

  return (
    <FacultyContext.Provider value={{ faculty, loading }}>
      {children}
    </FacultyContext.Provider>
  );
}

export const useFaculty = () => useContext(FacultyContext);

import React, { useEffect, useState } from "react";
// import './App.css';
import axios from "axios";
import Navbar from "./Navbar";
import './index.css';
// import ProductList from "./component";

interface User {
  name: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false); 

  const [selectedFloor,setSelectedFloor] = useState("FL1");

  const FRONTEND_URL = "https://ratiphong.tips.co.th:5173";

  useEffect(() => {
    let isMounted = true;

    const checkAuthentication = async () => {
      try {
        const response = await axios.get<User>(
          "https://ratiphong.tips.co.th:7112/api/User/Profile",
          { withCredentials: true }
        );

        if (isMounted && response.data?.name) {
          console.log("Profile fetched successfully:", response.data.name);
          setUser(response.data);
        } else {
          console.log("No user data in response.");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
          setAuthChecked(true);
        }
      }
    };

    checkAuthentication();

    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!loggingOut && authChecked && !user) {
      console.log("Authentication check finished. No user found. Redirecting to SSO...");
      window.location.href = `https://intranet.tips.co.th/ssocore/login?ReturnUrl=${encodeURIComponent(FRONTEND_URL)}`;
    }
  }, [authChecked, user, loggingOut]);

  const handleLogout = () => {
    setLoggingOut(true); 
    window.location.href = `https://intranet.tips.co.th/ssocore/logout?ReturnUrl=${encodeURIComponent(FRONTEND_URL)}`;
  };

  if (loading) return <div>Loading...</div>;
  if (!user && !loggingOut) return <div>Redirect to Log in...</div>;

  const getImageSrc = () =>{
    switch(selectedFloor){
      case "FL1":
        return "./src/img/TIPS_B4_FL1.png";
      case "FL2":
        return "./src/img/TIPS_B4_FL2.png";
      case "FL3_1":
        return "./src/img/TIPS_B4_FL3-1.png";
      case "FL3_2":
        return "./src/img/TIPS_B4_FL3-2.png";
      case "FL4":
        return "./src/img/TIPS_B4_FL4.png";
      default:
        return "./src/img/TIPS_B4_FL1.png";
    }
  }

  return (
  <div className="flex flex-col min-h-screen">
    <Navbar name={user?.name || ""} onLogout={handleLogout} selectedFloor={selectedFloor} onFloorChange={setSelectedFloor}/>

    <main className="flex-1 p-4 flex justify-center items-center">
      <img 
        src={getImageSrc()} 
        alt="Floor Image" 
        className="max-w-full h-auto"
      />
    </main>
  </div>
);

}

export default App;
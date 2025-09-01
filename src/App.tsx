import React, { useEffect, useState } from "react";
import './App.css';
import axios from "axios";
import Navbar from "./Navbar";

interface User {
  name: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false); 

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

  return (
    <div>
      <Navbar name={user?.name || ""} onLogout={handleLogout} />
      <div className="p-4">
        {/* <h1>Welcome, {user?.name}</h1> */}
        {/* <ProductList /> */}
      </div>
     <div style={{ textAlign: "center", marginTop: "20px" }}>
        <img 
          src="./src/img/TIPS_B4_FL1.png"  
          alt="My Image" 
          style={{ maxWidth: "100%", height: "auto" }}
        />
      </div>
    </div>
  );
}

export default App;
import { useEffect, useState } from "react";
import axios from "axios";

interface User {
  name: string;
}

const FRONTEND_URL = "https://ratiphong.tips.co.th:5173";

export function Auth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // ตรวจสอบการล็อกอิน
  useEffect(() => {
    let isMounted = true;

    const checkAuthentication = async () => {
      try {
        const response = await axios.get<User>(
          "https://ratiphong.tips.co.th:7112/api/User/Profile",
          { withCredentials: true }
        );

        if (isMounted && response.data?.name) {
          setUser(response.data);
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

    return () => {
      isMounted = false;
    };
  }, []);

  // ถ้าไม่ล็อกอิน ให้ redirect ไป SSO
  useEffect(() => {
    if (!loggingOut && authChecked && !user) {
      window.location.href = `https://intranet.tips.co.th/ssocore/login?ReturnUrl=${encodeURIComponent(
        FRONTEND_URL
      )}`;
    }
  }, [authChecked, user, loggingOut]);

  // Logout function
  const handleLogout = () => {
    setLoggingOut(true);
    window.location.href = `https://intranet.tips.co.th/ssocore/logout?ReturnUrl=${encodeURIComponent(
      FRONTEND_URL
    )}`;
  };

  return { user, loading, loggingOut, handleLogout };
}

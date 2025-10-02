import { useEffect, useState } from "react";

interface User {
  name: string;
}

const FRONTEND_URL = "https://ratiphong.tips.co.th:5173";

export function Auth() {
  // Mock user สำหรับ dev / testing
  const [user, setUser] = useState<User | null>({ name: "Mock User" });
  const [loading, setLoading] = useState(false);  // ไม่ต้อง loading
  const [authChecked, setAuthChecked] = useState(true);  // bypass check
  const [loggingOut, setLoggingOut] = useState(false);

  // handleLogout สำหรับ mock
  const handleLogout = () => {
    setLoggingOut(true);
    console.log("Logout clicked (mock)");
  };

  return { user, loading, loggingOut, handleLogout };
}

import { useEffect, useState } from "react";
import axios from "axios";

interface User {
  name: string;
  username: string;
}

export function Auth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        setUser(JSON.parse(savedUser));
        // ตั้งค่า Token ให้ Axios อัตโนมัติสำหรับการดึงข้อมูลครั้งต่อๆ ไป
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    window.location.reload(); // รีโหลดเพื่อให้ App.tsx แสดงหน้า Login
  };

  return { user, loading, handleLogout };
}
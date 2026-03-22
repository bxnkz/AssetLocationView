import { useEffect, useState } from "react";
import axios from "axios";

interface User {
  name: string;
  username: string;
  role: "admin" | "teacher";
}

export function Auth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    // redirect ไป / แทน reload เพื่อป้องกันหน้าขาวเมื่ออยู่ใน sub-route
    window.location.href = "/";
  };

  return { user, loading, handleLogout };
}
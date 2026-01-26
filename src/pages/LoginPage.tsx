import { useState } from "react";
import axios from "axios";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const backgroundImage = "/img/Bg-kusrc3.jpg"

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        username,
        password,
      });

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      window.location.href = "/"; 
      
    } catch (err: any) {
      setError(err.response?.data?.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  return (
<div 
    className="flex h-screen items-center justify-center bg-cover bg-center bg-no-repeat w-full"
    style={{ 
      backgroundImage: `url(${backgroundImage})`,
      backgroundAttachment: 'fixed' 
    }}
  >
      <form onSubmit={handleLogin} className="w-96 rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold">Asset Mapping Login</h2>
        {error && <div className="mb-4 text-center text-sm text-red-500">{error}</div>}
        <div className="mb-4">
          <label className="block text-sm font-medium">Username</label>
          <input 
            type="text" className="mt-1 w-full rounded border p-2"
            value={username} onChange={(e) => setUsername(e.target.value)} required
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium">Password</label>
          <input 
            type="password" className="mt-1 w-full rounded border p-2"
            value={password} onChange={(e) => setPassword(e.target.value)} required
          />
        </div>
        <button type="submit" className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700">
          Login
        </button>
      </form>
    </div>
  );
}
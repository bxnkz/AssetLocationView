import { useState } from "react";
import axios from "axios";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { username, password },
      );

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      window.location.href = "/";
    } catch (err: any) {
      setError(
        err.response?.data?.message || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
      );
    }
  };

  return (
    <div className="relative flex h-screen w-full font-sans overflow-hidden">
      {/* ฝั่งซ้าย: รูปพื้นหลัง */}
      <div className="absolute inset-0 z-0 lg:relative lg:w-2/3">
        <img
          src="/img/Bg-kusrc3.jpg"
          alt="Campus Background"
          className="h-full w-full object-cover"
        />
        {/* Overlay มืดลงเล็กน้อยเพื่อให้กล่องขาวเด่นขึ้นบน Mobile */}
        <div className="absolute inset-0 bg-black/40 lg:hidden"></div>
      </div>

      {/* ฝั่งขวา: Login */}
      <div className="relative z-10 flex w-full items-center justify-center bg-transparent lg:bg-white lg:w-1/3 p-6">
        <div className="flex w-full max-w-md flex-col items-center">
          {/* กล่องฟอร์ม */}
          <div className="w-full rounded-3xl bg-white/90 shadow-2xl lg:shadow-sm lg:bg-gray-100 p-8 md:p-10 backdrop-blur-sm lg:backdrop-blur-none">
            {/* โลโก้ */}
            <div className="mb-8 w-full flex justify-center lg:justify-center">
              <img
                src="\img\Sci_Logo_Eng.png"
                alt="KU Logo Normal"
                className="h-24 md:h-28 object-contain drop-shadow-lg lg:drop-shadow-none"
              />
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="rounded-md bg-red-100 p-3 text-center text-sm text-red-600">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-2 block text-lg font-semibold text-teal-800">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-md border-none p-3 text-gray-700 shadow-inner outline-none focus:ring-2 focus:ring-teal-600"
                  placeholder="Enter Username"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-lg font-semibold text-teal-800">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border-none p-3 text-gray-700 shadow-inner outline-none focus:ring-2 focus:ring-teal-600"
                  placeholder="Enter Password"
                  required
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#006B67] py-3 text-xl font-medium text-white transition-colors hover:bg-[#005a56]"
                >
                  Log In
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
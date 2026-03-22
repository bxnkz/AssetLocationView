import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../index.css";

export default function LoginPage() {

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {

    e.preventDefault();
    setError("");

    try {

      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          username: emailOrUsername,
          password
        }
      );

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      window.location.href = "/";

    } catch (err: any) {

      setError(
        err.response?.data?.message ||
        "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"
      );

    }
  };

  return (
    <div className="relative flex h-screen w-full  overflow-hidden">

      <div className="absolute inset-0 z-0 lg:relative lg:w-2/3">
        <img
          src="/img/Bg-kusrc3.jpg"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="relative z-10 flex w-full items-center justify-center bg-transparent lg:bg-white lg:w-1/3 p-6">

        <div className="flex w-full max-w-md flex-col items-center">

          <div className="w-full rounded-3xl bg-white/90 shadow-2xl lg:shadow-sm lg:bg-gray-100 p-8 md:p-10">

            <div className="mb-8 w-full flex justify-center">
              <img
                src="/img/Sci_Logo_Eng.png"
                className="h-24 md:h-28 object-contain"
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
                  ชื่อผู้ใช้ / Email
                </label>

                <input
                  type="text"
                  value={emailOrUsername}
                  onChange={(e) =>
                    setEmailOrUsername(e.target.value)
                  }
                  className="w-full rounded-md p-3"
                  placeholder="กรอกชื่อผู้ใช้ / Email"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-lg font-semibold text-teal-800">
                  รหัสผ่าน
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  className="w-full rounded-md p-3"
                  placeholder="กรอกรหัสผ่าน"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#006B67] py-3 text-xl text-white"
              >
                เข้าสู่ระบบ
              </button>

              <div className="flex justify-between text-sm mt-3">

                <Link
                  to="/forgot-password"
                  className="text-teal-600 hover:underline"
                >
                  ลืมรหัสผ่าน?
                </Link>

                <Link
                  to="/register"
                  className="text-teal-600 hover:underline"
                >
                  สมัครผู้ใช้ใหม่
                </Link>

              </div>

            </form>

          </div>

        </div>

      </div>

    </div>
  );
}
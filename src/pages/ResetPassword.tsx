import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import "../index.css";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/reset-password",
        { token, password }
      );
      setMessage(res.data.message);
      setTimeout(() => navigate("/"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen w-full overflow-hidden">

      {/* รูปพื้นหลังซ้าย — เหมือน LoginPage */}
      <div className="absolute inset-0 z-0 lg:relative lg:w-2/3">
        <img
          src="/img/Bg-kusrc3.jpg"
          alt="Campus Background"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 lg:hidden" />
      </div>

      {/* Form ขวา */}
      <div className="relative z-10 flex w-full items-center justify-center bg-transparent lg:bg-white lg:w-1/3 p-6">
        <div className="flex w-full max-w-md flex-col items-center">
          <div className="w-full rounded-3xl bg-white/90 shadow-2xl lg:shadow-sm lg:bg-gray-100 p-8 md:p-10">

            {/* โลโก้ */}
            <div className="mb-6 w-full flex justify-center">
              <img
                src="/img/Sci_Logo_Eng.png"
                alt="KU Logo"
                className="h-20 md:h-24 object-contain"
              />
            </div>

            <h2 className="text-center text-xl font-bold text-teal-800 mb-2">
              ตั้งรหัสผ่านใหม่
            </h2>
            <p className="text-center text-sm text-gray-500 mb-6">
              กรอกรหัสผ่านใหม่ของคุณด้านล่าง
            </p>

            {message && (
              <div className="rounded-md bg-green-100 p-3 text-center text-sm text-green-700 mb-4">
                {message} — กำลังพาไปหน้า Login...
              </div>
            )}
            {error && (
              <div className="rounded-md bg-red-100 p-3 text-center text-sm text-red-600 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-base font-semibold text-teal-800">
                  รหัสผ่านใหม่
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านใหม่"
                  required
                  className="w-full rounded-md border-none p-3 text-gray-700 shadow-inner outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-base font-semibold text-teal-800">
                  ยืนยันรหัสผ่าน
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                  required
                  className="w-full rounded-md border-none p-3 text-gray-700 shadow-inner outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#006B67] py-3 text-lg font-medium text-white transition-colors hover:bg-[#005a56] disabled:opacity-60"
                >
                  {loading ? "กำลังบันทึก..." : "บันทึกรหัสผ่านใหม่"}
                </button>
              </div>

              <p className="text-center text-sm text-gray-500">
                <Link to="/" className="text-teal-600 hover:underline font-medium">
                  ← กลับไปหน้า Login
                </Link>
              </p>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useDialog } from "../hooks/useDialog";
import "../index.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { toast } = useDialog();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        username, email, name, password,
      });
      toast("สมัครสมาชิกสำเร็จ", "success");
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "สมัครสมาชิกไม่สำเร็จ");
    }
  };

  return (
    <div className="relative flex h-screen w-full  overflow-hidden">

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

            <h2 className="text-center text-xl font-bold text-teal-800 mb-6">
              สมัครสมาชิก
            </h2>

            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <div className="rounded-md bg-red-100 p-3 text-center text-sm text-red-600">
                  {error}
                </div>
              )}

              {[
                { label: "ชื่อที่ใช้ในระบบ", type: "text", value: name, set: setName, placeholder: "กรอกชื่อที่ใช้ในระบบ" },
                { label: "ชื่อผู้ใช้", type: "text", value: username, set: setUsername, placeholder: "กรอกชื่อผู้ใช้" },
                { label: "อีเมล", type: "email", value: email, set: setEmail, placeholder: "กรอกอีเมล" },
                { label: "รหัสผ่าน", type: "password", value: password, set: setPassword, placeholder: "กรอกรหัสผ่าน" },
              ].map(({ label, type, value, set, placeholder }) => (
                <div key={label}>
                  <label className="mb-1.5 block text-base font-semibold text-teal-800">
                    {label}
                  </label>
                  <input
                    type={type}
                    value={value}
                    onChange={e => set(e.target.value)}
                    placeholder={placeholder}
                    required
                    className="w-full rounded-md border-none p-3 text-gray-700 shadow-inner outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              ))}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#006B67] py-3 text-lg font-medium text-white transition-colors hover:bg-[#005a56]"
                >
                  สมัครสมาชิก
                </button>
              </div>

              <p className="text-center text-sm text-gray-500 mt-2">
                มีบัญชีแล้ว?{" "}
                <Link to="/" className="text-teal-600 hover:underline font-medium">
                  เข้าสู่ระบบ
                </Link>
              </p>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}
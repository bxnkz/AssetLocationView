import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDialog } from "../hooks/useDialog";
import "../index.css";

interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  role: string;
}

const PROTECTED_USERS = ["Dev", "Dev2"];

export default function ManageUsers() {
  const navigate = useNavigate();
  const { toast, confirm } = useDialog();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [changingRole, setChangingRole] = useState<string | null>(null);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // ดึง username ของผู้ใช้ที่ login อยู่ เพื่อป้องกันการเปลี่ยน role ตัวเอง
  const currentUser: { username: string } | null = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch { return null; }
  })();

  const isCurrentUser = (username: string) =>
    currentUser?.username === username;

  const loadUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users", { headers });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const changeRole = async (id: string, newRole: string) => {
    setChangingRole(id);
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/users/${id}/role`,
        { role: newRole },
        { headers }
      );
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, role: res.data.user.role } : u))
      );
      toast("เปลี่ยน Role สำเร็จ", "success");
    } catch (err: any) {
      toast(err.response?.data?.message || "เปลี่ยน role ไม่สำเร็จ", "error");
    } finally {
      setChangingRole(null);
    }
  };

  const deleteUser = async (id: string, role: string) => {
    if (role === "admin") {
      toast("ไม่สามารถลบ Admin ได้ — กรุณาเปลี่ยน Role เป็น User ก่อน", "error");
      return;
    }
    if (!await confirm("ยืนยันการลบผู้ใช้?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`, { headers });
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast("ลบผู้ใช้สำเร็จ", "success");
    } catch (err: any) {
      toast(err.response?.data?.message || "ลบไม่สำเร็จ", "error");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ตรวจว่า row นี้ถูกล็อคจากการเปลี่ยน role หรือไม่ พร้อม reason
  const getRoleLockReason = (user: User): string | null => {
    if (PROTECTED_USERS.includes(user.username))
      return "ไม่สามารถเปลี่ยน Role ของ account นี้ได้";
    if (isCurrentUser(user.username))
      return "ไม่สามารถเปลี่ยน Role ของตัวเองได้";
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => navigate("/")}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-200 transition text-gray-500"
            title="กลับหน้าหลัก"
          >
            <i className="bi bi-arrow-left text-lg"></i>
          </button>
          <div className="w-10 h-10 rounded-xl bg-[#006B67] flex items-center justify-center">
            <i className="bi bi-people text-white text-lg"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">จัดการผู้ใช้งาน</h1>
            <p className="text-sm text-gray-500">เปลี่ยน Role หรือลบผู้ใช้ในระบบ</p>
          </div>
          <div className="ml-auto">
            <span className="bg-[#006B67]/10 text-[#006B67] text-sm font-medium px-3 py-1 rounded-full">
              {users.length} บัญชี
            </span>
          </div>
        </div>

        {/* Info banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 flex items-start gap-2 text-sm text-amber-700">
          <i className="bi bi-info-circle mt-0.5 shrink-0"></i>
          <span>
            Admin ไม่สามารถถูกลบได้ — ต้องเปลี่ยน Role เป็น User ก่อน
            และ Admin ไม่สามารถเปลี่ยน Role ของตัวเองได้เพื่อป้องกันการหลุดสิทธิ์
          </span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <i className="bi bi-arrow-repeat text-2xl mr-2"></i>
              กำลังโหลด...
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <i className="bi bi-person-x text-4xl mb-2"></i>
              <p>ไม่พบผู้ใช้งาน</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">ชื่อ</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Username</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Email</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">Role</th>
                  <th className="px-5 py-3.5 text-right font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => {
                  const roleLockReason = getRoleLockReason(user);
                  const isSelf = isCurrentUser(user.username);

                  return (
                    <tr
                      key={user._id}
                      className={`hover:bg-gray-50 transition ${isSelf ? "bg-[#006B67]/3" : ""}`}
                    >
                      <td className="px-5 py-3.5 font-medium text-gray-800">
                        <div className="flex items-center gap-2">
                          {user.name}
                          {isSelf && (
                            <span className="text-xs bg-[#006B67]/10 text-[#006B67] px-2 py-0.5 rounded-full font-medium">
                              คุณ
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">{user.username}</td>
                      <td className="px-5 py-3.5 text-gray-500">{user.email}</td>

                      {/* Role */}
                      <td className="px-5 py-3.5">
                        {roleLockReason ? (
                          // ล็อค — แสดง badge + ไอคอนกุญแจ
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border
                              ${user.role === "admin"
                                ? "bg-[#006B67]/10 border-[#006B67]/30 text-[#006B67]"
                                : "bg-gray-100 border-gray-200 text-gray-600"
                              }`}>
                              {user.role === "admin" ? "Admin" : "User"}
                            </span>
                            <span title={roleLockReason} className="text-gray-400 cursor-help">
                              <i className="bi bi-lock text-xs"></i>
                            </span>
                          </div>
                        ) : (
                          // dropdown เปลี่ยนได้
                          <div className="relative inline-block">
                            <select
                              value={user.role}
                              disabled={changingRole === user._id}
                              onChange={(e) => changeRole(user._id, e.target.value)}
                              className={`appearance-none text-xs font-semibold px-3 py-1.5 pr-7 rounded-full border cursor-pointer
                                focus:outline-none focus:ring-2 focus:ring-[#006B67]/30 transition
                                ${user.role === "admin"
                                  ? "bg-[#006B67]/10 border-[#006B67]/30 text-[#006B67]"
                                  : "bg-gray-100 border-gray-200 text-gray-600"
                                }
                                ${changingRole === user._id ? "opacity-60 cursor-not-allowed" : ""}
                              `}
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                              <i className={`text-xs opacity-60 ${changingRole === user._id ? "bi bi-arrow-repeat" : "bi bi-chevron-down"}`}></i>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Delete */}
                      <td className="px-5 py-3.5 text-right">
                        {PROTECTED_USERS.includes(user.username) || user.role === "admin" ? (
                          <span
                            title={
                              PROTECTED_USERS.includes(user.username)
                                ? "ไม่สามารถลบ account นี้ได้"
                                : "เปลี่ยน Role เป็น User ก่อนจึงจะลบได้"
                            }
                            className="text-gray-300 text-xs px-3 py-1.5 cursor-not-allowed select-none"
                          >
                            <i className="bi bi-trash mr-1"></i>ลบ
                          </span>
                        ) : (
                          <button
                            onClick={() => deleteUser(user._id, user.role)}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition text-xs font-medium"
                          >
                            <i className="bi bi-trash mr-1"></i>ลบ
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
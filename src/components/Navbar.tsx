import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../index.css";

interface NavBarProps {
  name: string;
  role: string;
  onLogout: () => void;
  onRoomChange: (building: string, floor: string, room: string) => void;
  hasLayout: boolean;
  onEditLayout: () => void;
}

const Navbar: React.FC<NavBarProps> = ({
  name,
  role,
  onLogout,
  onRoomChange,
  hasLayout,
  onEditLayout,
}) => {
  const navigate = useNavigate();
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [room, setRoom] = useState("");
  const [buildingData, setBuildingData] = useState<
    Record<string, Record<string, string[]>>
  >({});
  const loadRooms = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/rooms");
      setBuildingData(res.data);
      const buildings = Object.keys(res.data);
      if (buildings.length > 0) {
        const b = buildings[0];
        const floors = Object.keys(res.data[b] || {});
        const f = floors.length > 0 ? floors[0] : "";
        const r = f && res.data[b][f]?.length > 0 ? res.data[b][f][0] : "";
        setBuilding(b);
        setFloor(f);
        setRoom(r);
        onRoomChange(b, f, r);
      }
    } catch (err) {
      console.error("Load rooms error:", err);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const floors =
    building && buildingData[building]
      ? Object.keys(buildingData[building])
      : [];
  const rooms =
    building && floor && buildingData[building]?.[floor]
      ? buildingData[building][floor]
      : [];

  const selectClass =
    "px-2 py-1 rounded bg-[#006B67] text-white border border-white/40 " +
    "focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-40 text-sm";

  return (
    <>
      <nav className="flex items-center bg-[#006B67] text-white px-5 py-3 shadow-md font-medium gap-4">
        {/* Logo */}
        <div className="flex items-center shrink-0">
          <img
            src="/img/Sci_Symbol_Eng.PNG"
            alt="Science KU Logo"
            className="h-12 md:h-14 w-auto object-contain"
          />
        </div>

        {/* Room selector — กลาง */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-wrap gap-2 items-center border border-white/30 px-4 py-2 rounded-lg shadow">
            <select
              className={selectClass}
              value={building}
              onChange={(e) => {
                const b = e.target.value;
                setBuilding(b);
                setFloor("");
                setRoom("");
                onRoomChange(b, "", "");
              }}
            >
              <option value="">เลือกตึก</option>
              {Object.keys(buildingData).map((b) => (
                <option key={b} value={b} className="text-black">
                  ตึก {b}
                </option>
              ))}
            </select>

            <select
              className={selectClass}
              value={floor}
              disabled={!building}
              onChange={(e) => {
                const f = e.target.value;
                setFloor(f);
                setRoom("");
                onRoomChange(building, f, "");
              }}
            >
              <option value="">เลือกชั้น</option>
              {floors.map((f) => (
                <option key={f} value={f} className="text-black">
                  ชั้น {f}
                </option>
              ))}
            </select>

            <select
              className={selectClass}
              value={room}
              disabled={!floor}
              onChange={(e) => {
                const r = e.target.value;
                setRoom(r);
                onRoomChange(building, floor, r);
              }}
            >
              <option value="">เลือกห้อง</option>
              {rooms.map((r) => (
                <option key={r} value={r} className="text-black">
                  ห้อง {r}
                </option>
              ))}
            </select>

            {/* Layout status + ปุ่มแก้ไข */}
            {room && (
              <>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${
                    hasLayout
                      ? "bg-emerald-500/30 border-emerald-300/60 text-emerald-100"
                      : "bg-white/10 border-white/30 text-white/70"
                  }`}
                >
                  {hasLayout ? "✓ มี Layout" : "ยังไม่มี"}
                </span>

                <button
                  onClick={onEditLayout}
                  className="flex items-center gap-1 bg-white text-[#006B67] text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-white/90 transition shadow whitespace-nowrap"
                >
                  <i className="bi bi-pencil-square"></i>
                  {hasLayout ? "แก้ไข Layout" : "สร้าง Layout"}
                </button>
              </>
            )}

            {/* จัดการห้อง — ทุก role ทำได้ */}
            <button
              onClick={() => navigate("/manage-rooms")}
              className="flex items-center gap-1 bg-white/15 hover:bg-white/25 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition border border-white/30 whitespace-nowrap"
            >
              <i className="bi bi-door-open"></i>
              จัดการห้อง
            </button>
          </div>
        </div>

        {/* ขวา: Manage Users + User info + Logout */}
        <div className="flex items-center gap-3 shrink-0">
          {role === "admin" && (
            <button
              onClick={() => navigate("/manage-users")}
              className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition whitespace-nowrap"
            >
              <i className="bi bi-people"></i>
              <span className="hidden md:inline">จัดการผู้ใช้</span>
            </button>
          )}

          <span className="hidden sm:block text-sm">สวัสดี, {name}</span>

          <button
            onClick={onLogout}
            title="ออกจากระบบ"
            className="w-9 h-9 flex items-center justify-center hover:bg-white/20 rounded-full transition text-lg"
          >
            <i className="bi bi-power"></i>
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDialog } from "../hooks/useDialog";
import "../index.css";

interface RoomData {
  building: string;
  floor: string;
  room: string;
}

export default function ManageRooms() {
  const navigate = useNavigate();
  const { toast, confirm } = useDialog();
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [loading, setLoading] = useState(true);

  // filter state
  const [filterBuilding, setFilterBuilding] = useState("");
  const [filterFloor, setFilterFloor] = useState("");

  // add room state
  const [showAdd, setShowAdd] = useState(false);
  const [newBuilding, setNewBuilding] = useState("");
  const [newFloor, setNewFloor] = useState("");
  const [newRoomSuffix, setNewRoomSuffix] = useState(""); // เฉพาะ 2 หลักท้าย
  const [addError, setAddError] = useState("");

  // ห้องเต็ม = ตึก + ชั้น + ห้อง(2หลัก)
  const roomPreview =
    newBuilding && newFloor
      ? `${newBuilding}${newFloor}`
      : newBuilding
      ? `${newBuilding}`
      : "";

  const fullRoomNumber = roomPreview + newRoomSuffix;

  const loadRooms = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/rooms");
      const data: Record<string, Record<string, string[]>> = res.data;

      const flat: RoomData[] = [];
      for (const b of Object.keys(data)) {
        for (const f of Object.keys(data[b])) {
          for (const r of data[b][f]) {
            flat.push({ building: b, floor: f, room: r });
          }
        }
      }
      flat.sort(
        (a, b) =>
          a.building.localeCompare(b.building) ||
          Number(a.floor) - Number(b.floor) ||
          a.room.localeCompare(b.room)
      );
      setRooms(flat);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // รับเฉพาะตัวเลขจำนวนเต็ม ไม่รับทศนิยม
  const toInt = (raw: string) => raw.replace(/[^0-9]/g, "");

  const validateAndAdd = async () => {
    setAddError("");

    if (!newBuilding) { setAddError("กรุณากรอกเลขตึก"); return; }
    if (!newFloor)    { setAddError("กรุณากรอกชั้น"); return; }
    if (!newRoomSuffix) { setAddError("กรุณากรอกเลขห้อง 2 หลัก"); return; }

    const floorNum = parseInt(newFloor);
    if (floorNum < 1 || floorNum > 50) {
      setAddError("ชั้นต้องอยู่ระหว่าง 1–50");
      return;
    }

    if (!/^\d{2}$/.test(newRoomSuffix)) {
      setAddError("เลขห้องต้องเป็นตัวเลข 2 หลักพอดี (00–99)");
      return;
    }

    const roomNum = parseInt(newRoomSuffix);
    if (roomNum < 0 || roomNum > 99) {
      setAddError("เลขห้องต้องอยู่ระหว่าง 00–99");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/rooms/add", {
        building: newBuilding,
        floor: newFloor,
        room: fullRoomNumber,
      });
      setShowAdd(false);
      setNewBuilding("");
      setNewFloor("");
      setNewRoomSuffix("");
      setAddError("");
      await loadRooms();
    } catch (err: any) {
      setAddError(err.response?.data?.message || "เพิ่มห้องไม่สำเร็จ");
    }
  };

  const deleteRoom = async (building: string, floor: string, room: string) => {
    if (!await confirm(`ยืนยันการลบห้อง ${room}?\nหากห้องนี้มี Layout บันทึกไว้จะถูกลบออกด้วย`)) return;
    try {
      const res = await axios.delete(
        `http://localhost:5000/api/rooms/${building}/${floor}/${room}`
      );
      setRooms((prev) =>
        prev.filter(
          (r) =>
            !(r.building === building && r.floor === floor && r.room === room)
        )
      );
      const layoutsDeleted = res.data?.layoutsDeleted ?? 0;
      toast(
        layoutsDeleted > 0
          ? `ลบห้อง ${room} และ Layout สำเร็จ`
          : `ลบห้อง ${room} สำเร็จ`,
        "success"
      );
    } catch (err: any) {
      toast(err.response?.data?.message || "ลบไม่สำเร็จ", "error");
    }
  };

  const closeModal = () => {
    setShowAdd(false);
    setNewBuilding("");
    setNewFloor("");
    setNewRoomSuffix("");
    setAddError("");
  };

  useEffect(() => {
    loadRooms();
  }, []);

  // unique buildings + floors จาก data จริง (ใช้กรอง)
  const uniqueBuildings = [...new Set(rooms.map((r) => r.building))].sort();
  const uniqueFloors = filterBuilding
    ? [
        ...new Set(
          rooms.filter((r) => r.building === filterBuilding).map((r) => r.floor)
        ),
      ].sort((a, b) => Number(a) - Number(b))
    : [];

  const filtered = rooms.filter(
    (r) =>
      (!filterBuilding || r.building === filterBuilding) &&
      (!filterFloor || r.floor === filterFloor)
  );

  const inputClass =
    "border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#006B67]/30 focus:border-[#006B67]";

  const modalInputClass =
    "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#006B67]/30 focus:border-[#006B67]";

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
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
            <i className="bi bi-door-open text-white text-lg"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">จัดการห้องเรียน</h1>
            <p className="text-sm text-gray-500">เพิ่มหรือลบห้องในระบบ</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="bg-[#006B67]/10 text-[#006B67] text-sm font-medium px-3 py-1 rounded-full">
              {rooms.length} ห้อง
            </span>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 bg-[#006B67] text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-[#005a56] transition shadow"
            >
              <i className="bi bi-plus-lg"></i>
              เพิ่มห้อง
            </button>
          </div>
        </div>

        {/* Filter — ใช้ input แทน dropdown สำหรับตึก, dropdown dynamic สำหรับชั้น */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-3 mb-4 flex items-center gap-3 flex-wrap">
          <i className="bi bi-funnel text-gray-400"></i>
          <span className="text-sm text-gray-500">กรอง:</span>

          <select
            value={filterBuilding}
            onChange={(e) => { setFilterBuilding(e.target.value); setFilterFloor(""); }}
            className={inputClass}
          >
            <option value="">ทุกตึก</option>
            {uniqueBuildings.map((b) => (
              <option key={b} value={b}>ตึก {b}</option>
            ))}
          </select>

          <select
            value={filterFloor}
            disabled={!filterBuilding}
            onChange={(e) => setFilterFloor(e.target.value)}
            className={inputClass + " disabled:opacity-40"}
          >
            <option value="">ทุกชั้น</option>
            {uniqueFloors.map((f) => (
              <option key={f} value={f}>ชั้น {f}</option>
            ))}
          </select>

          {(filterBuilding || filterFloor) && (
            <button
              onClick={() => { setFilterBuilding(""); setFilterFloor(""); }}
              className="text-xs text-gray-400 hover:text-gray-600 hover:underline"
            >
              ล้างตัวกรอง
            </button>
          )}
          <span className="ml-auto text-xs text-gray-400">{filtered.length} ห้อง</span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <i className="bi bi-arrow-repeat text-2xl mr-2"></i>กำลังโหลด...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <i className="bi bi-door-closed text-4xl mb-2"></i>
              <p>ไม่พบห้องเรียน</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">ตึก</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">ชั้น</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">ห้อง</th>
                  <th className="px-5 py-3.5 text-right font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((r) => (
                  <tr
                    key={`${r.building}-${r.floor}-${r.room}`}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-5 py-3.5">
                      <span className="bg-[#006B67]/10 text-[#006B67] text-xs font-semibold px-2.5 py-1 rounded-full">
                        ตึก {r.building}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">ชั้น {r.floor}</td>
                    <td className="px-5 py-3.5 font-medium text-gray-800">ห้อง {r.room}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => deleteRoom(r.building, r.floor, r.room)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition text-xs font-medium"
                      >
                        <i className="bi bi-trash mr-1"></i>ลบ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Popup เพิ่มห้อง */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 shadow-2xl w-96 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">เพิ่มห้องเรียน</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {addError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5">
                {addError}
              </div>
            )}

            {/* ตึก */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                ตึก
                <span className="text-xs text-gray-400 ml-1">(ตัวเลขจำนวนเต็ม)</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="เช่น 15, 26"
                value={newBuilding}
                onChange={(e) => {
                  const v = toInt(e.target.value);
                  setNewBuilding(v);
                }}
                className={modalInputClass}
              />
            </div>

            {/* ชั้น */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                ชั้น
                <span className="text-xs text-gray-400 ml-1">(1–50)</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="เช่น 1, 5"
                value={newFloor}
                onChange={(e) => {
                  const v = toInt(e.target.value);
                  // ไม่ให้เกิน 50
                  if (v === "" || parseInt(v) <= 50) setNewFloor(v);
                }}
                className={modalInputClass}
              />
              {newFloor && (parseInt(newFloor) < 1 || parseInt(newFloor) > 50) && (
                <p className="text-xs text-red-500">ชั้นต้องอยู่ระหว่าง 1–50</p>
              )}
            </div>

            {/* ห้อง — แสดง prefix ล็อคไว้ */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                เลขห้อง
                <span className="text-xs text-gray-400 ml-1">(2 หลัก, 00–99)</span>
              </label>
              <div className="flex items-center gap-0">
                {/* prefix ล็อค */}
                <div className={`
                  flex items-center px-3 py-2 text-sm rounded-l-lg border border-r-0
                  ${roomPreview
                    ? "bg-[#006B67]/8 border-[#006B67]/30 text-[#006B67] font-semibold"
                    : "bg-gray-100 border-gray-200 text-gray-400"}
                `}>
                  {roomPreview || "ตึก+ชั้น"}
                </div>
                {/* input 2 หลัก */}
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={2}
                  placeholder="01"
                  value={newRoomSuffix}
                  onChange={(e) => {
                    const v = toInt(e.target.value).slice(0, 2);
                    setNewRoomSuffix(v);
                  }}
                  className="flex-1 border border-gray-200 rounded-r-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#006B67]/30 focus:border-[#006B67]"
                />
              </div>
              {/* preview ห้องเต็ม */}
              {fullRoomNumber.length > 0 && newRoomSuffix.length === 2 && (
                <p className="text-xs text-[#006B67] font-medium">
                  รหัสห้องที่จะบันทึก: <span className="font-bold">{fullRoomNumber}</span>
                </p>
              )}
              {newRoomSuffix.length > 0 && newRoomSuffix.length < 2 && (
                <p className="text-xs text-amber-500">กรอกให้ครบ 2 หลัก</p>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={closeModal}
                className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={validateAndAdd}
                disabled={!newBuilding || !newFloor || newRoomSuffix.length !== 2}
                className="flex-1 bg-[#006B67] text-white py-2 rounded-lg text-sm hover:bg-[#005a56] transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
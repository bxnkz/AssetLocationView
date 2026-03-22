import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../index.css";

interface RoomData {
  building: string;
  floor: string;
  room: string;
}

const BUILDINGS = ["15", "26"];
const FLOORS: Record<string, string[]> = {
  "15": ["1", "2", "3", "4","5", "6", "7", "8", "9"],
  "26": ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
};

export default function ManageRooms() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [loading, setLoading] = useState(true);

  // filter state
  const [filterBuilding, setFilterBuilding] = useState("");
  const [filterFloor, setFilterFloor] = useState("");

  // add room state
  const [showAdd, setShowAdd] = useState(false);
  const [newBuilding, setNewBuilding] = useState("");
  const [newFloor, setNewFloor] = useState("");
  const [newRoom, setNewRoom] = useState("");
  const [addError, setAddError] = useState("");

  const loadRooms = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/rooms");
      const data: Record<string, Record<string, string[]>> = res.data;

      // แปลง nested object เป็น flat array
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
          a.floor.localeCompare(b.floor) ||
          a.room.localeCompare(b.room),
      );
      setRooms(flat);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addRoom = async () => {
    setAddError("");
    if (!newBuilding || !newFloor || !newRoom) {
      setAddError("กรุณากรอกข้อมูลให้ครบ");
      return;
    }
    if (!/^\d{5}$/.test(newRoom)) {
      setAddError("เลขห้องต้องเป็นตัวเลข 5 หลัก");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/rooms/add", {
        building: newBuilding,
        floor: newFloor,
        room: newRoom,
      });
      setShowAdd(false);
      setNewBuilding("");
      setNewFloor("");
      setNewRoom("");
      setAddError("");
      await loadRooms();
    } catch (err: any) {
      setAddError(err.response?.data?.message || "เพิ่มห้องไม่สำเร็จ");
    }
  };

  const deleteRoom = async (building: string, floor: string, room: string) => {
    if (!confirm(`ยืนยันการลบห้อง ${room}?`)) return;
    try {
      await axios.delete(
        `http://localhost:5000/api/rooms/${building}/${floor}/${room}`,
      );
      setRooms((prev) =>
        prev.filter(
          (r) =>
            !(r.building === building && r.floor === floor && r.room === room),
        ),
      );
    } catch (err: any) {
      alert(err.response?.data?.message || "ลบไม่สำเร็จ");
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const filtered = rooms.filter(
    (r) =>
      (!filterBuilding || r.building === filterBuilding) &&
      (!filterFloor || r.floor === filterFloor),
  );

  const availableFloors = filterBuilding ? (FLOORS[filterBuilding] ?? []) : [];

  const inputClass =
    "border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#006B67]/30 focus:border-[#006B67]";

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

        {/* Filter */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-3 mb-4 flex items-center gap-3">
          <i className="bi bi-funnel text-gray-400"></i>
          <span className="text-sm text-gray-500">กรอง:</span>
          <select
            value={filterBuilding}
            onChange={(e) => {
              setFilterBuilding(e.target.value);
              setFilterFloor("");
            }}
            className={inputClass}
          >
            <option value="">ทุกตึก</option>
            {BUILDINGS.map((b) => (
              <option key={b} value={b}>
                ตึก {b}
              </option>
            ))}
          </select>
          <select
            value={filterFloor}
            disabled={!filterBuilding}
            onChange={(e) => setFilterFloor(e.target.value)}
            className={inputClass + " disabled:opacity-40"}
          >
            <option value="">ทุกชั้น</option>
            {availableFloors.map((f) => (
              <option key={f} value={f}>
                ชั้น {f}
              </option>
            ))}
          </select>
          {(filterBuilding || filterFloor) && (
            <button
              onClick={() => {
                setFilterBuilding("");
                setFilterFloor("");
              }}
              className="text-xs text-gray-400 hover:text-gray-600 hover:underline"
            >
              ล้างตัวกรอง
            </button>
          )}
          <span className="ml-auto text-xs text-gray-400">
            {filtered.length} ห้อง
          </span>
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
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">
                    ตึก
                  </th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">
                    ชั้น
                  </th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">
                    ห้อง
                  </th>
                  <th className="px-5 py-3.5 text-right font-semibold text-gray-600">
                    Actions
                  </th>
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
                    <td className="px-5 py-3.5 text-gray-600">
                      ชั้น {r.floor}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-gray-800">
                      ห้อง {r.room}
                    </td>
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
          <div className="bg-white rounded-2xl p-6 shadow-2xl w-80 space-y-4">
            <h2 className="text-lg font-bold text-gray-800">เพิ่มห้องเรียน</h2>

            {addError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5">
                {addError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">ตึก</label>
              <select
                value={newBuilding}
                onChange={(e) => {
                  setNewBuilding(e.target.value);
                  setNewFloor("");
                }}
                className={inputClass + " w-full"}
              >
                <option value="">เลือกตึก</option>
                {BUILDINGS.map((b) => (
                  <option key={b} value={b}>
                    ตึก {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">ชั้น</label>
              <select
                value={newFloor}
                disabled={!newBuilding}
                onChange={(e) => setNewFloor(e.target.value)}
                className={inputClass + " w-full disabled:opacity-40"}
              >
                <option value="">เลือกชั้น</option>
                {(FLOORS[newBuilding] ?? []).map((f) => (
                  <option key={f} value={f}>
                    ชั้น {f}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                เลขห้อง
              </label>
              <input
                type="text"
                maxLength={5}
                placeholder="เช่น 26501"
                value={newRoom}
                onChange={(e) => setNewRoom(e.target.value)}
                className={inputClass + " w-full"}
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  setShowAdd(false);
                  setNewBuilding("");
                  setNewFloor("");
                  setNewRoom("");
                  setAddError("");
                }}
                className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={addRoom}
                className="flex-1 bg-[#006B67] text-white py-2 rounded-lg text-sm hover:bg-[#005a56] transition"
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

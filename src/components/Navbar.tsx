import React, { useState } from "react";
import "../index.css";

interface NavBarProps {
  name: string;
  onLogout: () => void;
  onRoomChange: (building: string, floor: string, room: string) => void;
}

const buildingData: {
  [building: string]: {
    floors: {
      [floor: string]: string[];
    };
  };
} = {
  "26": {
    floors: {
      "5": ["26501", "26502", "26503"],
      "7": ["26701", "26702", "26703"],
    },
  },
  "17": {
    floors: {
      "1": ["17101", "17102", "17103"],
      "2": ["17201", "17202", "17203"],
      "3": ["17301", "17302", "17303"],
      "4": ["17401", "17402", "17403"],
    },
  },
};

const Navbar: React.FC<NavBarProps> = ({ name, onLogout, onRoomChange }) => {
  const [building, setBuilding] = useState("17");
  const [floor, setFloor] = useState("1");
  const [room, setRoom] = useState("17101");

  const floors = building ? Object.keys(buildingData[building].floors) : [];
  const rooms =
    building && floor ? buildingData[building].floors[floor] : [];

  const selectClass =
    "px-2 py-1 rounded bg-[#006B67] text-white border border-white/40 " +
    "focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-40";

  return (
    <nav className="relative flex items-center bg-[#006B67] text-white px-5 py-4 shadow-md font-medium">

      <div className="flex items-center gap-2 min-w-[120px]">
        <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
          🏢
        </div>
        <span className="hidden md:block">My App</span>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2">
        <div className="flex gap-3 items-center bg-[#006B67] border border-white/30 px-4 py-2 rounded-lg shadow">

          {/* Building */}
          <select
            className={selectClass}
            value={building}
            onChange={(e) => {
              const newBuilding = e.target.value;
              setBuilding(newBuilding);
              setFloor("");
              setRoom("");

              onRoomChange(newBuilding, "", "");
            }}
          >
            <option value="">เลือกตึก</option>
            {Object.keys(buildingData).map((b) => (
              <option key={b} value={b} className="text-black">
                ตึก {b}
              </option>
            ))}
          </select>

          {/* Floor */}
          <select
            className={selectClass}
            value={floor}
            disabled={!building}
            onChange={(e) => {
              const newFloor = e.target.value;
              setFloor(newFloor);
              setRoom("");

              onRoomChange(building, newFloor, "");
            }}
          >
            <option value="">เลือกชั้น</option>
            {floors.map((f) => (
              <option key={f} value={f} className="text-black">
                ชั้น {f}
              </option>
            ))}
          </select>

          {/* Room */}
          <select
            className={selectClass}
            value={room}
            disabled={!floor}
            onChange={(e) => {
              const newRoom = e.target.value;
              setRoom(newRoom);

              onRoomChange(building, floor, newRoom);
            }}
          >
            <option value="">เลือกห้อง</option>
            {rooms.map((r) => (
              <option key={r} value={r} className="text-black">
                ห้อง {r}
              </option>
            ))}
          </select>

        </div>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <span className="hidden sm:block">Welcome, {name}</span>

        <button
          onClick={onLogout}
          title="Logout"
          className="w-9 h-9 flex items-center justify-center hover:bg-white/20 rounded-full transition text-lg"
        >
          <i className="bi bi-power"></i>
        </button>
      </div>

    </nav>
  );
};

export default Navbar;
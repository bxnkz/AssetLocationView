import { useState, useEffect } from "react";
import { Stage, Layer, Rect, Text, Group } from "react-konva";

import Navbar from "./components/Navbar";
import { Auth } from "./hooks/Auth";
import FloatingButton from "./components/FloatingButton";
import AutoGen from "./components/AutoGen";
import LoginPage from "./pages/LoginPage";

import { generateLayout } from "./layout/algorithms/SmartLayoutGen";

interface DeskAsset {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

function App() {
  const { user, loading, handleLogout } = Auth();

  const [layouts, setLayouts] = useState<DeskAsset[][]>([]);
  const [currentLayoutIndex, setCurrentLayoutIndex] = useState(0);

  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [room, setRoom] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomRect, setRoomRect] = useState({ width: 0, height: 0 });

  const STAGE_WIDTH = 1100;
  const STAGE_HEIGHT = 700;

  if (loading) return <div className="p-4">Loading...</div>;
  if (!user) return <LoginPage />;

  const handleGenerateAllLayouts = (config: any) => {
    const scale = 50;

    const roomPixelWidth = config.roomWidth * scale;
    const roomPixelHeight = config.roomHeight * scale;

    setRoomRect({
      width: roomPixelWidth,
      height: roomPixelHeight,
    });

    const startX = (STAGE_WIDTH - roomPixelWidth) / 2;
    const startY = (STAGE_HEIGHT - roomPixelHeight) / 2;

    const algorithms: ("grid" | "row-pattern")[] = [
      "grid",
      "row-pattern",
    ];

    const generatedLayouts: DeskAsset[][] = algorithms.map((algo) =>
      generateLayout(
        algo,
        { ...config, algorithm: algo },
        startX,
        startY,
        scale
      )
    );

    setLayouts(generatedLayouts);
    setCurrentLayoutIndex(0);
    setIsModalOpen(false);
  };

  const currentLayout = layouts[currentLayoutIndex] || [];

  /** SAVE LAYOUT */
  const saveLayout = async () => {
    if (!building || !floor || !room) {
      alert("กรุณาเลือก ตึก / ชั้น / ห้อง");
      return;
    }

    try {
      await fetch("http://localhost:5000/api/layout/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          building,
          floor,
          room,
          desks: currentLayout,
          roomWidth: roomRect.width,
          roomHeight: roomRect.height,
        }),
      });

      alert("Save Layout สำเร็จ");
    } catch (err) {
      console.error(err);
      alert("Save ไม่สำเร็จ");
    }
  };

  const loadLayout = async (building: string, floor: string, room: string) => {
    if (!building || !floor || !room) {
      setLayouts([]);
      setRoomRect({ width: 0, height: 0 });
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/layout/${building}/${floor}/${room}`
      );

      const data = await res.json();

      if (!data || !data.desks) {
        // ถ้าห้องนี้ยังไม่มี layout
        setLayouts([]);
        setRoomRect({ width: 0, height: 0 });
        return;
      }

      setLayouts([data.desks]);
      setCurrentLayoutIndex(0);

      setRoomRect({
        width: data.roomWidth,
        height: data.roomHeight,
      });

    } catch (err) {
      console.error("Load layout error", err);

      setLayouts([]);
      setRoomRect({ width: 0, height: 0 });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">

      <Navbar
        name={user.name}
        onLogout={handleLogout}
        onRoomChange={(b, f, r) => {
          setBuilding(b);
          setFloor(f);
          setRoom(r);

          loadLayout(b, f, r);
        }}
      />

      <div className="flex justify-center items-start pt-2">
        <Stage width={STAGE_WIDTH} height={STAGE_HEIGHT}>
          <Layer>

            {roomRect.width > 0 && (
              <Rect
                x={(STAGE_WIDTH - roomRect.width) / 2}
                y={(STAGE_HEIGHT - roomRect.height) / 2}
                width={roomRect.width}
                height={roomRect.height}
                stroke="#374151"
                strokeWidth={3}
              />
            )}

            {currentLayout.map((desk) => (
              <Group key={desk.id} x={desk.x} y={desk.y} draggable>
                <Rect
                  width={desk.width}
                  height={desk.height}
                  fill="#3b82f6"
                  cornerRadius={4}
                />
                <Text
                  text={desk.name}
                  fill="white"
                  width={desk.width}
                  align="center"
                  y={desk.height / 2 - 6}
                />
              </Group>
            ))}

          </Layer>
        </Stage>
      </div>

      {layouts.length > 1 && (
        <div className="flex justify-center gap-4 pb-4">

          <button
            className="px-4 py-2 border rounded"
            disabled={currentLayoutIndex === 0}
            onClick={() =>
              setCurrentLayoutIndex((prev) => Math.max(prev - 1, 0))
            }
          >
            <i className="bi bi-arrow-left"></i>
          </button>

          <span className="font-medium">
            Layout {currentLayoutIndex + 1} / {layouts.length}
          </span>

          <button
            className="px-4 py-2 border rounded"
            disabled={currentLayoutIndex === layouts.length - 1}
            onClick={() =>
              setCurrentLayoutIndex((prev) =>
                Math.min(prev + 1, layouts.length - 1)
              )
            }
          >
            <i className="bi bi-arrow-right"></i>
          </button>

        </div>
      )}

      {/* SAVE BUTTON */}
      {layouts.length > 0 && (
        <div className="flex justify-center pb-6">
          <button
            onClick={saveLayout}
            className="
        flex items-center gap-2
        bg-gradient-to-r from-green-500 to-emerald-600
        text-white
        px-6 py-3
        rounded-xl
        shadow-lg
        hover:shadow-xl
        hover:scale-105
        transition
        duration-200
        font-medium
      "
          >
            <i className="bi bi-save text-lg"></i>
            Save Layout
          </button>
        </div>
      )}

      <FloatingButton onClick={() => setIsModalOpen(true)} />

      <AutoGen
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGenerateAll={handleGenerateAllLayouts}
      />

    </div>
  );
}

export default App;
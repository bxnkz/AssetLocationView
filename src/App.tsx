import { useState } from "react";
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomRect, setRoomRect] = useState({ width: 0, height: 0 });

  const STAGE_WIDTH = 1100;
  const STAGE_HEIGHT = 700;

  if (loading) return <div className="p-4">Loading...</div>;
  if (!user) return <LoginPage />;

  /** 🔹 Generate ทุก layout */
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

    const generatedLayouts: DeskAsset[][] = algorithms.map((algo, index) =>
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

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar name={user.name} onLogout={handleLogout} />

      <div className="flex justify-center p-4">
        <Stage width={STAGE_WIDTH} height={STAGE_HEIGHT}>
          <Layer>
            {/* ห้อง */}
            {roomRect.width > 0 && (
              <Rect
                x={(STAGE_WIDTH - roomRect.width) / 2}
                y={(STAGE_HEIGHT - roomRect.height) / 2}
                width={roomRect.width}
                height={roomRect.height}
                stroke="#374151"
                strokeWidth={3}
                dash={[8, 4]}
              />
            )}

            {/* โต๊ะ */}
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

      {/* ปุ่มเลื่อนเลือก layout */}
      {layouts.length > 1 && (
        <div className="flex justify-center gap-4 pb-4">
          <button
            className="px-4 py-2 border rounded"
            disabled={currentLayoutIndex === 0}
            onClick={() =>
              setCurrentLayoutIndex((prev) => Math.max(prev - 1, 0))
            }
          >
            ◀ Previous
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
            Next ▶
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
import { useState } from "react";
import { Stage, Layer, Rect, Text, Group } from "react-konva";

import Navbar from "./components/Navbar";
import { Auth } from "./hooks/Auth";
import FloatingButton from "./components/FloatingButton";
import AutoGen from "./components/AutoGen";

import { generateLayout } from "./layout/algorithms/SmartLayoutGen";
import LoginPage from "./pages/LoginPage";

interface DeskAsset {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

function App() {
  // ✅ เรียก Auth ที่นี่
  const { user, loading, handleLogout } = Auth();

  const [placedAssets, setPlacedAssets] = useState<DeskAsset[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomRect, setRoomRect] = useState({ width: 0, height: 0 });

  const STAGE_WIDTH = 1100;
  const STAGE_HEIGHT = 700;


  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!user){
    return <LoginPage/>
  }

  const handleGenerateLayout = (config: any) => {
    const scale = 50;

    const roomPixelWidth = config.roomWidth * scale;
    const roomPixelHeight = config.roomHeight * scale;

    setRoomRect({
      width: roomPixelWidth,
      height: roomPixelHeight,
    });

    const startX = (STAGE_WIDTH - roomPixelWidth) / 2;
    const startY = (STAGE_HEIGHT - roomPixelHeight) / 2;

    const desks = generateLayout(
      config.algorithm,
      config,
      startX,
      startY,
      scale
    );

    setPlacedAssets(desks);
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {user && (
        <Navbar
          name={user.name}
          onLogout={handleLogout}
        />
      )}

      <div className="flex justify-center p-4">
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
                dash={[8, 4]}
              />
            )}

            {placedAssets.map((desk) => (
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

      <FloatingButton onClick={() => setIsModalOpen(true)} />

      <AutoGen
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGenerate={handleGenerateLayout}
      />
    </div>
  );
}

export default App;
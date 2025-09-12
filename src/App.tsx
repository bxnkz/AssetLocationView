import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./components/Navbar";
import FloorImage from "./components/FloorImage";
import AssetImage from "./components/AssetImage";
import Sidebar from "./components/Sidebar";
import FloatingButton from "./components/FloatingButton";
import { Stage, Layer } from "react-konva";
import { Auth } from "./hooks/Auth";

interface AssetType {
  id: string; // ใช้ assetCode หรือ serial เป็น unique id
  name: string;
  assetCode?: string;
  x: number;
  y: number;
}

interface Product {
  assetCode: string;
  name: string;
}

interface ApiProduct {
  assetCode: string;
  prodName: string;
  prodDesc: string;
  ip: string;
  serial: string;
}

function App() {
  const { user, loading, loggingOut, handleLogout } = Auth();

  const [selectedFloor, setSelectedFloor] = useState("FL1");
  const [placedAssetsByFloor, setPlacedAssetsByFloor] = useState<
    Record<string, AssetType[]>
  >({
    FL1: [],
    FL2: [],
    FL3_1: [],
    FL3_2: [],
    FL4: [],
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [printerAssets, setPrinterAssets] = useState<Product[]>([]);
  const [selectedPrinterCode, setSelectedPrinterCode] = useState<string | null>(
    null
  );

  // ดึงข้อมูล Printer จาก API
  useEffect(() => {
    const fetchPrinters = async () => {
      try {
        const response = await axios.get<ApiProduct[]>(
          "https://ratiphong.tips.co.th:7112/api/Product/type/42",
          { withCredentials: true }
        );

        const mappedPrinters: Product[] = response.data.map((p) => ({
          assetCode: p.assetCode || p.serial, // ใช้ assetCode หรือ serial
          name: p.prodName,
        }));

        setPrinterAssets(mappedPrinters);
      } catch (err) {
        console.error("Error fetching printer assets:", err);
      }
    };
    fetchPrinters();
  }, []);

  const getImageSrc = () => {
    switch (selectedFloor) {
      case "FL1":
        return "/img/TIPS_B4_FL1.png";
      case "FL2":
        return "/img/TIPS_B4_FL2.png";
      case "FL3_1":
        return "/img/TIPS_B4_FL3-1.png";
      case "FL3_2":
        return "/img/TIPS_B4_FL3-2.png";
      case "FL4":
        return "/img/TIPS_B4_FL4.png";
      default:
        return "/img/TIPS_B4_FL1.png";
    }
  };

  const getCurrentFloorAssets = () => placedAssetsByFloor[selectedFloor] || [];

  const handleDragEnd = (id: string, x: number, y: number) => {
    setPlacedAssetsByFloor((prev) => {
      const currentAssets = prev[selectedFloor] || [];
      const updated = currentAssets.map((a) =>
        a.id === id ? { ...a, x, y } : a
      );
      return { ...prev, [selectedFloor]: updated };
    });
  };

  const handleAddAsset = (name: string, assetCode?: string) => {
    const codeToAdd =
      name === "Printer" && selectedPrinterCode
        ? selectedPrinterCode
        : assetCode;

    if (!codeToAdd) return; // ป้องกันกรณีไม่มี id

    setPlacedAssetsByFloor((prev) => {
      const currentAssets = prev[selectedFloor] || [];
      const updated = [
        ...currentAssets,
        {
          id: codeToAdd,
          name,
          assetCode: codeToAdd,
          x: 50,
          y: 50,
        },
      ];
      return { ...prev, [selectedFloor]: updated };
    });

    setSelectedPrinterCode(null);
  };

  const handleSelectPrinterCode = (code: string) => {
    setSelectedPrinterCode(code);
    handleAddAsset("Printer", code);
  };

  if (loading) return <div>Loading...</div>;
  if (!user && !loggingOut) return <div>Redirect to Log in...</div>;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        name={user?.name || ""}
        onLogout={handleLogout}
        selectedFloor={selectedFloor}
        onFloorChange={setSelectedFloor}
      />

      <main className="flex-1 p-4 flex justify-center items-start relative">
        <Stage width={800} height={600}>
          <Layer>
            <FloorImage src={getImageSrc()} />
            {getCurrentFloorAssets().map((asset) => (
              <AssetImage
                key={asset.id}
                id={asset.id}
                name={asset.name}
                assetCode={asset.assetCode}
                x={asset.x}
                y={asset.y}
                onDragEnd={handleDragEnd}
              />
            ))}
          </Layer>
        </Stage>

        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          printerAssets={printerAssets}
          onAddAsset={handleAddAsset}
          onSelectPrinterCode={handleSelectPrinterCode}
        />
      </main>

      <FloatingButton onClick={() => setSidebarOpen(true)} />
    </div>
  );
}

export default App;
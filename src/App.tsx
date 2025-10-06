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
  id: string;
  type: "Table" | "Printer" | "UPS" | "Switch";
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
  const [selectedPrinterCode, setSelectedPrinterCode] = useState<string | null>(null);

  const [upsAssets, setUPSAssets] = useState<Product[]>([]);
  const [selectedUPSCode, setSelectedUPSCode] = useState<string | null>(null);

  const [switchAssets, setSwitchAsset] = useState<Product[]>([]);
  const [selectedSwitchCode, setSelectedSwitchCode] = useState<string | null>(null);

  useEffect(() => {
    // Fetch UPS Data
    const fetchUPS = async () => {
      try {
        const response = await axios.get<ApiProduct[]>(
          "https://ratiphong.tips.co.th:7112/api/Product/type/2",
          { withCredentials: true }
        );

        const mappedUPS: Product[] = response.data.map((p) => ({
          assetCode: p.assetCode || p.serial,
          name: p.prodName,
        }));

        setUPSAssets(mappedUPS);
      } catch (err) {
        console.error("Error fetching UPS assets:", err);
      }
    };

    // Fetch Printer Data
    const fetchPrinters = async () => {
      try {
        const response = await axios.get<ApiProduct[]>(
          "https://ratiphong.tips.co.th:7112/api/Product/type/42",
          { withCredentials: true }
        );

        const mappedPrinters: Product[] = response.data.map((p) => ({
          assetCode: p.assetCode || p.serial,
          name: p.prodName,
        }));

        setPrinterAssets(mappedPrinters);
      } catch (err) {
        console.error("Error fetching printer assets:", err);
      }
    };

    // Fetch Switch Data
    const fetchSwitch = async () => {
      try {
        const response = await axios.get<ApiProduct[]>(
          "https://ratiphong.tips.co.th:7112/api/Product/type/12",
          { withCredentials: true }
        );

        const mappedSwitch: Product[] = response.data.map((p) => ({
          assetCode: p.assetCode || p.serial,
          name: p.prodName,
        }));
        setSwitchAsset(mappedSwitch);
      } catch (err) {
        console.error("Error fetching switch assets:", err);
      }
    };

    // Fetch Asset Positions
    const fetchAssets = async () => {
      try {
        const floors = ["FL1", "FL2", "FL3_1", "FL3_2", "FL4"];
        const result: Record<string, AssetType[]> = {};

        for (const floor of floors) {
          const response = await axios.get<
            { assetCode: string; posX: number; posY: number; typeName: string }[]
          >(
            `https://ratiphong.tips.co.th:7112/api/AssetPosition/${floor}`,
            { withCredentials: true }
          );

          result[floor] = response.data.map((a) => ({
            id: a.assetCode,
            type: a.typeName as AssetType["type"],
            name: a.typeName,
            assetCode: a.assetCode,
            x: a.posX,
            y: a.posY,
          }));
        }

        setPlacedAssetsByFloor(result);
      } catch (err) {
        console.error("Error fetching saved assets:", err);
      }
    };

    fetchAssets();
    fetchPrinters();
    fetchUPS();
    fetchSwitch();
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

      const movedAsset = updated.find((a) => a.id === id);
      if (movedAsset) saveAssetPosition(movedAsset);

      return { ...prev, [selectedFloor]: updated };
    });
  };

  // Delete Asset
  const handleDeleteAsset = async (asset: AssetType) => {
    const confirmed = window.confirm("Are you sure delete asset ?");
    if (!confirmed) return;
    try {
      await axios.post(
        "https://ratiphong.tips.co.th:7112/api/AssetPosition/DeleteAsset",
        { AssetCode: asset.assetCode, Floor: selectedFloor },
        { withCredentials: true }
      );

      setPlacedAssetsByFloor((prev) => {
        const currentAssets = prev[selectedFloor] || [];
        const updated = currentAssets.filter((a) => a.id !== asset.id);
        return { ...prev, [selectedFloor]: updated };
      });

      console.log("Deleted asset:", asset.assetCode);
    } catch (err: any) {
      if (err.response) {
        console.error("Fail to delete asset. Server responded with:", err.response.data);
      } else if (err.request) {
        console.error("Fail to delete asset. No response received:", err.request);
      } else {
        console.error("Fail to delete asset. Error:", err.message);
      }
    }
  };

  const handleAddAsset = (name: string, assetCode?: string) => {
    const codeToAdd =
      name === "Printer" && selectedPrinterCode
        ? selectedPrinterCode
        : name === "UPS" && selectedUPSCode
        ? selectedUPSCode
        : name === "Switch" && selectedSwitchCode
        ? selectedSwitchCode
        : assetCode;

    if (!codeToAdd) return;

    const type =
      name === "Printer"
        ? "Printer"
        : name === "UPS"
        ? "UPS"
        : name === "Switch"
        ? "Switch"
        : "Table";

    const newAsset: AssetType = {
      id: codeToAdd,
      type,
      name,
      assetCode: codeToAdd,
      x: 50,
      y: 50,
    };

    setPlacedAssetsByFloor((prev) => {
      const currentAssets = prev[selectedFloor] || [];
      return {
        ...prev,
        [selectedFloor]: [...currentAssets, newAsset],
      };
    });

    // Save to Database
    saveAssetPosition(newAsset);

    if (name === "Printer") setSelectedPrinterCode(null);
    if (name === "UPS") setSelectedUPSCode(null);
    if (name === "Switch") setSelectedSwitchCode(null);
  };

  const handleSelectPrinterCode = (code: string) => {
    setSelectedPrinterCode(code);
    handleAddAsset("Printer", code);
  };

  const handleSelectUPSCode = (code: string) => {
    setSelectedUPSCode(code);
    handleAddAsset("UPS", code);
  };

  const handleSelectSwitchCode = (code: string) => {
    setSelectedSwitchCode(code);
    handleAddAsset("Switch", code);
  };

  const saveAssetPosition = async (asset: AssetType) => {
    try {
      await axios.post(
        "https://ratiphong.tips.co.th:7112/api/AssetPosition",
        {
          AssetCode: asset.assetCode,
          Floor: selectedFloor,
          PosX: asset.x,
          PosY: asset.y,
          UpdatedBy: user?.name || "Unknow"
        },
        { withCredentials: true,
          headers: { "Content-Type": "application/json" }
         }
      );
      console.log("Saved asset:", asset);
    } catch (err) {
      console.log(err);
    }
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
                type={asset.type}
                name={asset.name}
                assetCode={asset.assetCode}
                x={asset.x}
                y={asset.y}
                onDragEnd={handleDragEnd}
                onDelete={() => handleDeleteAsset(asset)}
              />
            ))}
          </Layer>
        </Stage>

        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          printerAssets={printerAssets}
          upsAssets={upsAssets}
          switchAssets={switchAssets}  
          onAddAsset={handleAddAsset}
          onSelectPrinterCode={handleSelectPrinterCode}
          onSelectUPSCode={handleSelectUPSCode}
          onSelectSwitchCode={handleSelectSwitchCode} 
        />
      </main>

      <FloatingButton onClick={() => setSidebarOpen(true)} />
    </div>
  );
}

export default App;
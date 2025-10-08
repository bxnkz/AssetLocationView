import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./components/Navbar";
import FloorImage from "./components/FloorImage";
import AssetImage from "./components/AssetImage";
import Sidebar from "./components/Sidebar";
import FloatingButton from "./components/FloatingButton";
import { Stage, Layer } from "react-konva";
import { Auth } from "./hooks/Auth";
import GetAsset, { AssetType, Product } from "./components/getAsset";

function App() {
  useEffect(() => {
    document.title = "Asset Location";
  }, []);

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

  const [upsAssets, setUPSAssets] = useState<Product[]>([]);
  const [selectedUPSCode, setSelectedUPSCode] = useState<string | null>(null);

  const [switchAssets, setSwitchAsset] = useState<Product[]>([]);
  const [selectedSwitchCode, setSelectedSwitchCode] = useState<string | null>(
    null
  );

  const [computerAssets, setComputerAsset] = useState<Product[]>([]);
  const [selectedComputerCode, setSelectedComputerCode] = useState<string | null>(
    null
  );

  const [notebookAssets, setNotebookAsset] = useState<Product[]>([]);
  const [selectedNotebookCode, setSelectedNotebookCode] = useState<string | null>(
    null
  );

  const [phoneAssets, setPhoneAsset] = useState<Product[]>([]);
  const [selectedPhoneCode, setSelectedPhoneCode] = useState<string | null>(
    null
  );

  const getImageSrc = () => {
    return `/img/TIPS_B4_${selectedFloor}.png`;
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
      console.error("Error deleting asset:", err);
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
        : name === "Computer" && selectedComputerCode
        ? selectedComputerCode
        : name === "Notebook" && selectedNotebookCode
        ? selectedNotebookCode
        : name === "Phone" && selectedPhoneCode
        ? selectedPhoneCode
        : assetCode;

    if (!codeToAdd) return;

    const type =
      name === "Printer"
        ? "Printer"
        : name === "UPS"
        ? "UPS"
        : name === "Switch"
        ? "Switch"
        : name === "Notebook"
        ? "Notebook"
        : name === "Computer"
        ? "Computer"
        : name === "Phone"
        ? "Phone"
        : undefined;


    const newAsset: AssetType = {
      id: codeToAdd,
      type,
      name,
      assetCode: codeToAdd,
      x: 50,
      y: 50,
    };

    setPlacedAssetsByFloor((prev) => ({
      ...prev,
      [selectedFloor]: [...(prev[selectedFloor] || []), newAsset],
    }));

    saveAssetPosition(newAsset);

    if (name === "Printer") setSelectedPrinterCode(null);
    if (name === "UPS") setSelectedUPSCode(null);
    if (name === "Switch") setSelectedSwitchCode(null);
    if (name === "Computer") setSelectedComputerCode(null);
    if (name === "Notebook") setSelectedNotebookCode(null);
    if (name === "Phone") setSelectedPhoneCode(null);
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

  const handleSelectComputerCode = (code: string) => {
    setSelectedComputerCode(code);
    handleAddAsset("Computer",code)
  }

  const handleSelectNotebookCode = (code: string) => {
    setSelectedNotebookCode(code);
    handleAddAsset("Notebook",code)
  }

  const handleSelectPhoneCode = (code: string) => {
    setSelectedPhoneCode(code);
    handleAddAsset("Phone",code)
  }

  const saveAssetPosition = async (asset: AssetType) => {
    try {
      await axios.post(
        "https://ratiphong.tips.co.th:7112/api/AssetPosition",
        {
          AssetCode: asset.assetCode,
          Floor: selectedFloor,
          PosX: asset.x,
          PosY: asset.y,
          UpdatedBy: user?.name || "Unknown",
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
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
        {/* component ที่ fetch asset ทั้งหมด */}
        <GetAsset
          setPrinterAssets={setPrinterAssets}
          setUPSAssets={setUPSAssets}
          setSwitchAsset={setSwitchAsset}
          setComputerAsset={setComputerAsset}
          setNotebookAsset={setNotebookAsset}
          setPhoneAsset={setPhoneAsset}
          setPlacedAssetsByFloor={setPlacedAssetsByFloor}
        />

        <Stage width={1362} height={890}>
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
          computerAssets={computerAssets}
          notebookAssets={notebookAssets}
          phoneAssets={phoneAssets}
          onAddAsset={handleAddAsset}
          onSelectPrinterCode={handleSelectPrinterCode}
          onSelectUPSCode={handleSelectUPSCode}
          onSelectSwitchCode={handleSelectSwitchCode}
          onSelectComputerCode={handleSelectComputerCode}
          onSelectNotebookCode={handleSelectNotebookCode}
          onSelectPhoneCode={handleSelectPhoneCode}
        />
      </main>

      <FloatingButton onClick={() => setSidebarOpen(true)} />
    </div>
  );
}

export default App;
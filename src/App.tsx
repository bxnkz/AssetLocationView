import { useState } from "react";
import Navbar from "./components/Navbar";
import FloorImage from "./components/FloorImage";
import AssetImage from "./components/AssetImage";
import Sidebar from "./components/Sidebar";
import FloatingButton from "./components/FloatingButton";
import { Stage, Layer } from "react-konva";
import { Auth } from "./hooks/Auth";
import AssetManager, { AssetType, Product } from "./components/AssetManager";

function App() {
  const { user, loading, loggingOut, handleLogout } = Auth();

  const [selectedFloor, setSelectedFloor] = useState("FL1");
  const [selectedSite, setSelectedSite] = useState("B4");
  const [selectedDepartment, setSelectedDepartment] = useState("IT");
  const [placedAssets, setPlacedAssets] = useState<AssetType[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return <div>Loading...</div>;
  if (!user && !loggingOut) return <div>Redirect to Log in...</div>;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        name={user?.name || ""}
        onLogout={handleLogout}
        selectedFloor={selectedFloor}
        onFloorChange={setSelectedFloor}
        selectedSite={selectedSite}
        onSiteChange={setSelectedSite}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={setSelectedDepartment}
      />

      <AssetManager
        selectedSite={selectedSite}
        selectedFloor={selectedFloor}
        selectedDepartment={selectedDepartment}
        userName={user?.name || ""}
        placedAssets={placedAssets}
        setPlacedAssets={setPlacedAssets}
      >
        {({
          printerAssets,
          upsAssets,
          switchAssets,
          computerAssets,
          notebookAssets,
          phoneAssets,
          handleDragEnd,
          handleDeleteAsset,
          handleAddAsset,
        }) => (
          <main className="flex-1 p-4 flex justify-center items-start relative">
            <Stage width={800} height={600}>
              <Layer>
                <FloorImage
                  selectedSite={selectedSite}
                  selectedFloor={selectedFloor}
                  selectedDepartment={selectedDepartment}
                />
                {placedAssets.map((asset) => (
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
            />
          </main>
        )}
      </AssetManager>

      <FloatingButton onClick={() => setSidebarOpen(true)} />
    </div>
  );
}

export default App;

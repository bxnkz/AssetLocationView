import { useState } from "react";
import Navbar from "./components/Navbar";
import FloorImage from "./components/FloorImage";
import AssetImage from "./components/AssetImage";
import Sidebar from "./components/Sidebar";
import FloatingButton from "./components/FloatingButton";
import { Stage, Layer } from "react-konva";
import { Auth } from "./hooks/Auth";
import AssetManager, { ApiProduct, AssetType, Product } from "./components/AssetManager";
import AssetPopup from "./components/AssetPopup";
import axios from "axios";
import { Label, Tag, Text } from "react-konva";

function App() {
  const { user, loading, loggingOut, handleLogout } = Auth();

  const [selectedFloor, setSelectedFloor] = useState("FL1");
  const [selectedSite, setSelectedSite] = useState("B4");
  const [selectedDepartment, setSelectedDepartment] = useState("IT");
  const [placedAssets, setPlacedAssets] = useState<AssetType[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [selectedAsset, setSelectedAsset] = useState<AssetType | null>(null);
  const [assetDetails, setAssetDetails] = useState<ApiProduct | null>(null);
  const [isPopupLoading, setIsPopupLoading] = useState(false);

  const handleAssetClick = async (asset: AssetType) => {
    if(!asset.assetCode) return;

    setSelectedAsset(asset);
    setIsPopupLoading(true);
    setAssetDetails(null);

    try{
      const res = await axios.get<ApiProduct>(
        `https://ratiphong.tips.co.th:7112/api/Product?assetCode=${encodeURIComponent(asset.assetCode)}`,
        { withCredentials: true }
      );
      setAssetDetails(res.data);
    }catch(error){
      console.error("Error fetching asset details:", error);
    }finally{
      setIsPopupLoading(false);
    }
  };

  const handleClosePopup = () =>{
    setSelectedAsset(null);
    setAssetDetails(null);
  }

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
          <main className="flex-1 p-4 flex justify-center items-center relative overflow-auto">
            <Stage width={1400} height={900} onClick={(e) => {
              if(e.target === e.target.getStage()){
                handleClosePopup();
              }
            }}>
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
                    onClick={() => handleAssetClick(asset)}
                  />
                ))}
                {isPopupLoading && selectedAsset && (
                  <Text text="Loading..." x={selectedAsset.x + 40} y={selectedAsset.y} fontSize={14} fill="black" />
                )}
                
                {!isPopupLoading && selectedAsset && assetDetails && (
                  <AssetPopup
                    asset={selectedAsset}
                    details={assetDetails}
                    onClose={handleClosePopup}
                  />
                )}
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
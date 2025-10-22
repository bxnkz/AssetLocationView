import { useState } from "react";
import { Product } from "./AssetManager";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onAddAsset: (name: string, assetCode?: string) => void;
  printerAssets?: Product[];
  upsAssets?: Product[];
  switchAssets?: Product[];
  computerAssets?: Product[];
  notebookAssets?: Product[];
  phoneAssets?: Product[];
}

const assetTypeConfig = [
  { name: "Printer", iconSrc: "/assets/printer.png" },
  { name: "UPS", iconSrc: "/assets/ups.png" },
  { name: "Switch", iconSrc: "/assets/hub.png" },
  { name: "Computer", iconSrc: "/assets/computer.png" },
  { name: "Notebook", iconSrc: "/assets/notebook.png" },
  { name: "Phone", iconSrc: "/assets/phone.png" },
];

const Sidebar = ({
  open,
  onClose,
  onAddAsset,
  printerAssets = [],
  upsAssets = [],
  switchAssets = [],
  computerAssets = [],
  notebookAssets = [],
  phoneAssets = [],
}: SidebarProps) => {
  const [showCodes, setShowCodes] = useState<
    "none" | "Printer" | "UPS" | "Notebook" | "Computer" | "Phone" | "Switch"
  >("none");
  const [searchTerm, setSearchTerm] = useState("");

  const handleAssetClick = (name: string) => {
    if (["Printer", "UPS", "Switch", "Notebook", "Computer", "Phone"].includes(name)) {
      setShowCodes(name as "Printer" | "UPS" | "Switch" | "Notebook" | "Computer" | "Phone");
    } else {
      setShowCodes("none");
      onAddAsset(name);
      onClose();
    }
  };

  const handleCodeClick = (code: string) => {
    if (showCodes !== "none") {
      onAddAsset(showCodes, code);
      setShowCodes("none");
      onClose();
    }
  };

  const getCodeList = () => {
    if (showCodes === "Printer") return printerAssets;
    if (showCodes === "UPS") return upsAssets;
    if (showCodes === "Switch") return switchAssets;
    if (showCodes === "Computer") return computerAssets;
    if (showCodes === "Notebook") return notebookAssets;
    if (showCodes === "Phone") return phoneAssets;
    return [];
  };

  const filteredAssets = getCodeList().filter(
    (p) =>
      p.assetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGoback = () => {
    setShowCodes("none");
    setSearchTerm("");
  };

  const totalAsset =
    printerAssets.length +
    upsAssets.length +
    switchAssets.length +
    computerAssets.length +
    notebookAssets.length +
    phoneAssets.length;

  const getAssetCount = (name: string) => {
    switch (name) {
      case "Printer":
        return printerAssets.length;
      case "UPS":
        return upsAssets.length;
      case "Switch":
        return switchAssets.length;
      case "Computer":
        return computerAssets.length;
      case "Notebook":
        return notebookAssets.length;
      case "Phone":
        return phoneAssets.length;
      default:
        return 0;
    }
  };

  return (
    <div
      className={`absolute top-0 left-0 h-full w-64 bg-gray-300 shadow-lg transform transition-transform duration-300 z-50 flex flex-col ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex justify-between items-center p-4 border-b bg-white text-xl font-medium">
        Select Assets
        <button onClick={onClose}>
          <i className="bi bi-x-lg text-xl"></i>
        </button>
      </div>
      <div className="text-end px-2 text-black">Total assets : {totalAsset}</div>
      <div className="overflow-y-auto h-full flex-1">
        <div key={showCodes}>
          {showCodes === "none" ? (
            <div className="p-4 space-y-4">
              {assetTypeConfig.map((asset) => (
                <div
                  key={asset.name}
                  className="relative bg-white shadow-sm p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => handleAssetClick(asset.name)}
                >
                  <div className="flex justify-center mb-2">
                    <img src={asset.iconSrc} alt={asset.name} className="h-12 w-12" />
                  </div>
                  <div className="text-center text-gray-700 text-sm font-medium">
                    {asset.name} ({getAssetCount(asset.name)})
                  </div>
                  <div className="absolute top-2 right-2 bg-gray-800 text-white rounded-full h-5 w-5 flex items-center justify-center text-sm">
                    <i className="bi bi-plus"></i>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4">
              <button
                onClick={handleGoback}
                className="mb-4 text-blue-600 hover:underline text-md font-medium"
              >
                &larr; Back
              </button>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search assets ..."
                className="w-full p-2 border bg-white mb-3 text-md font-medium"
              />
              <div className="space-y-2">
                {filteredAssets.length > 0 ? (
                  filteredAssets.map((p) => (
                    <div
                      key={p.assetCode}
                      className="p-2 hover:bg-blue-100 bg-white cursor-pointer text-sm font-medium"
                      onClick={() => handleCodeClick(p.assetCode)}
                    >
                      {p.assetCode} - {p.name}
                    </div>
                  ))
                ) : (
                  <div className="text-sm font-medium">Loading data...</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
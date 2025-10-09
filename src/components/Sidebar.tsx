import { useState } from "react";
import {Product} from "./AssetManager";

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
  const [showCodes, setShowCodes] = useState<"none" | "Printer" | "UPS" | "Notebook" | "Computer" | "Phone" | "Switch">("none");
  const [searchTerm, setSearchTerm] = useState("");

  const handleAssetClick = (name: string) => {
    if (["Printer", "UPS", "Switch", "Notebook", "Computer", "Phone"].includes(name)) {
      setShowCodes(name as "Printer" | "UPS" | "Switch" | "Notebook" | "Computer"| "Phone" );
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

  return (
    <div
      className={`absolute top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-bold">Asset</h2>
        <button onClick={onClose}>
          <i className="bi bi-x-lg text-xl"></i>
        </button>
      </div>

      <div className="p-4 space-y-2 overflow-y-auto h-full">
        {showCodes === "none" ? (
          ["Table", "Printer", "UPS", "Switch", "Computer", "Notebook", "Phone"].map((item) => (
            <div
              key={item}
              className="p-2 bg-gray-200 rounded cursor-pointer"
              onClick={() => handleAssetClick(item)}
            >
              {item}
            </div>
          ))
        ) : (
          <>
            <button
              onClick={() => {
                setShowCodes("none");
                setSearchTerm(""); // reset search
              }}
              className="mb-4 text-blue-600 hover:underline"
            >
              &larr; Back to Assets
            </button>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search assets ..."
              className="w-full p-2 border rounded mb-3"
            />
            {filteredAssets.length > 0 ? (
              filteredAssets.map((p) => (
                <div
                  key={p.assetCode}
                  className="p-2 bg-gray-200 rounded cursor-pointer"
                  onClick={() => handleCodeClick(p.assetCode)}
                >
                  {p.assetCode} - {p.name}
                </div>
              ))
            ) : (
              <div>Loading data...</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

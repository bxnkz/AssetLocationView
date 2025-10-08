import React, { useState } from "react";

interface Product {
  assetCode: string;
  name: string;
}

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
  onSelectPrinterCode?: (code: string) => void;
  onSelectUPSCode?: (code: string) => void;
  onSelectSwitchCode?: (code: string) => void;
  onSelectComputerCode?: (code: string) => void;
  onSelectNotebookCode?: (code: string) => void;
  onSelectPhoneCode?: (code: string) => void;
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
  onSelectPrinterCode,
  onSelectUPSCode,
  onSelectSwitchCode,
  onSelectComputerCode,
  onSelectNotebookCode,
  onSelectPhoneCode,
}: SidebarProps) => {
  const [showCodes, setShowCodes] = useState<"none" | "Printer" | "UPS" | "Switch" | "Computer" | "Notebook" | "Phone">("none");
  const [searchTerm, setSearchTerm] = useState("");

  const handleAssetClick = (name: string) => {
    if (name === "Printer") {
      setShowCodes("Printer");
    } else if (name === "UPS") {
      setShowCodes("UPS");
    } else if (name === "Switch") {
      setShowCodes("Switch");
    } else if (name === "Computer"){
      setShowCodes("Computer");
    }else if (name === "Notebook"){
      setShowCodes("Notebook")
    }else if (name === "Phone"){
      setShowCodes("Phone")
    }
    else {
      setShowCodes("none");
      onAddAsset(name);
      onClose();
    }
  };

  const handleCodeClick = (code: string, type: "Printer" | "UPS" | "Switch" | "Computer" | "Notebook" | "Phone") => {
    if (type === "Printer") onSelectPrinterCode?.(code);
    if (type === "UPS") onSelectUPSCode?.(code);
    if (type === "Switch") onSelectSwitchCode?.(code); 
    if (type === "Computer") onSelectComputerCode?.(code);
    if (type === "Notebook") onSelectNotebookCode?.(code);
    if (type === "Phone") onSelectPhoneCode?.(code);
    setShowCodes("none");
    onClose();
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
    (p) => p.assetCode.toLowerCase().includes(searchTerm.toLowerCase())
    || p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          ["Computer", "Notebook", "Printer", "UPS", "Switch","Phone"].map((item) => (
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

            <input type="text" value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} 
            placeholder="Search assets ..." className="w-full p-2 border rounded mb-3"
            />
            {filteredAssets.length > 0 ? (
              filteredAssets.map((p) => (
                <div
                  key={p.assetCode}
                  className="p-2 bg-gray-200 rounded cursor-pointer"
                  onClick={() => handleCodeClick(p.assetCode, showCodes)}
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
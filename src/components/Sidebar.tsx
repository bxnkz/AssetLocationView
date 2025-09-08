import React, { useState } from "react";

interface Product {
  assetCode: string;
  name: string;
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onAddAsset: (name: string, assetCode?: string) => void; // <- แก้ตรงนี้
  printerAssets?: Product[]; // <- optional เผื่อยังโหลดไม่เสร็จ
  onSelectPrinterCode?: (code: string) => void; // <- optional
}

const Sidebar = ({
  open,
  onClose,
  onAddAsset,
  printerAssets = [],
  onSelectPrinterCode,
}: SidebarProps) => {
  const [showPrinterCodes, setShowPrinterCodes] = useState(false);

  const handleAssetClick = (name: string) => {
    if (name === "Printer") {
      // เปลี่ยนให้เปิด regardless, แต่ถ้ายังไม่มี printerAssets แสดงข้อความโหลด
      setShowPrinterCodes(true);
    } else {
      setShowPrinterCodes(false);
      onAddAsset(name);
      onClose();
    }
  };

  const handlePrinterCodeClick = (code: string) => {
    onSelectPrinterCode?.(code);
    setShowPrinterCodes(false);
    onClose();
  };

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
        {!showPrinterCodes ? (
          ["Table", "Printer", "UPS", "Switch"].map((item) => (
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
              onClick={() => setShowPrinterCodes(false)}
              className="mb-4 text-blue-600 hover:underline"
            >
              &larr; Back to Assets
            </button>

            {printerAssets.length > 0 ? (
              printerAssets.map((printer) => (
                <div
                  key={printer.assetCode || printer.name}
                  className="p-2 bg-gray-200 rounded cursor-pointer"
                  onClick={() => handlePrinterCodeClick(printer.assetCode)}
                >
                  {printer.assetCode || "N/A"} - {printer.name}
                </div>
              ))
            ) : (
              <div>Loading printer data...</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
import React, { useEffect, useState } from "react";
import axios from "axios";


export interface AssetType {
  id: string;
  type: "Table" | "Printer" | "UPS" | "Switch";
  name: string;
  assetCode?: string;
  x: number;
  y: number;
}

export interface Product {
  assetCode: string;
  name: string;
}

export interface ApiProduct {
  assetCode: string;
  prodName: string;
  prodDesc: string;
  ip: string;
  serial: string;
}

interface AssetManagerProps {
  selectedSite: string;
  selectedFloor: string;
  selectedDepartment: string;
  userName: string;
  placedAssets: AssetType[];
  setPlacedAssets: (assets: AssetType[]) => void;
  children: (handlers: {
    printerAssets: Product[];
    upsAssets: Product[];
    switchAssets: Product[];
    handleDragEnd: (id: string, x: number, y: number) => void;
    handleDeleteAsset: (asset: AssetType) => void;
    handleAddAsset: (name: string, assetCode?: string) => void;
  }) => JSX.Element;
}

const AssetManager: React.FC<AssetManagerProps> = ({
  selectedSite,
  selectedFloor,
  selectedDepartment,
  userName,
  placedAssets,
  setPlacedAssets,
  children,
}) => {
  const [printerAssets, setPrinterAssets] = useState<Product[]>([]);
  const [upsAssets, setUPSAssets] = useState<Product[]>([]);
  const [switchAssets, setSwitchAssets] = useState<Product[]>([]);

  // โหลด asset จาก API
  useEffect(() => {
    const fetchAssetsByType = async (type: number, setter: React.Dispatch<React.SetStateAction<Product[]>>) => {
      try {
        const res = await axios.get<ApiProduct[]>(
          `https://ratiphong.tips.co.th:7112/api/Product/type/${type}`,
          { withCredentials: true }
        );
        const mapped: Product[] = res.data.map(p => ({
          assetCode: p.assetCode || p.serial,
          name: p.prodName,
        }));
        setter(mapped);
      } catch (err) {
        console.error("Error fetching assets type", type, err);
      }
    };

    fetchAssetsByType(42, setPrinterAssets); // Printer
    fetchAssetsByType(2, setUPSAssets);      // UPS
    fetchAssetsByType(12, setSwitchAssets);  // Switch
  }, [selectedSite, selectedFloor, selectedDepartment]);

  // โหลดตำแหน่ง asset จาก floor
  useEffect(() => {
    const fetchAssetPositions = async () => {
      try {
        const res = await axios.get<{ assetCode: string; posX: number; posY: number; typeName: string }[]>(
          `https://ratiphong.tips.co.th:7112/api/AssetPosition/${selectedFloor}`,
          { withCredentials: true }
        );
        const mapped: AssetType[] = res.data.map(a => ({
          id: a.assetCode,
          type: a.typeName as AssetType["type"],
          name: a.typeName,
          assetCode: a.assetCode,
          x: a.posX,
          y: a.posY,
        }));
        setPlacedAssets(mapped);
      } catch (err) {
        console.error("Error fetching asset positions", err);
      }
    };

    fetchAssetPositions();
  }, [selectedSite, selectedFloor, selectedDepartment]);

  // Save asset
  const saveAssetPosition = async (asset: AssetType) => {
    try {
      await axios.post(
        `https://ratiphong.tips.co.th:7112/api/AssetPosition`,
        {
          AssetCode: asset.assetCode,
          Floor: selectedFloor,
          PosX: asset.x,
          PosY: asset.y,
          UpdatedBy: userName || "Unknown",
        },
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );
      console.log("Saved asset:", asset);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragEnd = (id: string, x: number, y: number) => {
    const updated = placedAssets.map(a => a.id === id ? { ...a, x, y } : a);
    setPlacedAssets(updated);
    const moved = updated.find(a => a.id === id);
    if (moved) saveAssetPosition(moved);
  };

  const handleDeleteAsset = async (asset: AssetType) => {
    const confirmed = window.confirm("Are you sure delete asset?");
    if (!confirmed) return;
    try {
      await axios.post(
        "https://ratiphong.tips.co.th:7112/api/AssetPosition/DeleteAsset",
        { AssetCode: asset.assetCode, Floor: selectedFloor },
        { withCredentials: true }
      );
      setPlacedAssets(placedAssets.filter(a => a.id !== asset.id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAsset = (name: string, assetCode?: string) => {
    if (!assetCode) return;
    const type = name === "Printer" ? "Printer" : name === "UPS" ? "UPS" : name === "Switch" ? "Switch" : "Table";
    const newAsset: AssetType = { id: assetCode, type, name, assetCode, x: 50, y: 50 };
    setPlacedAssets([...placedAssets, newAsset]);
    saveAssetPosition(newAsset);
  };

  return children({
    printerAssets,
    upsAssets,
    switchAssets,
    handleDragEnd,
    handleDeleteAsset,
    handleAddAsset
  });
};

export default AssetManager;

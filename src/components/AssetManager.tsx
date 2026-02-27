// import React, { useEffect, useState } from "react";
// import axios from "axios";

// export interface AssetType {
//   id: string;
//   type: "Computer" | "Printer" | "UPS" | "Switch" | "Notebook" | "Phone";
//   name: string;
//   assetCode?: string;
//   x: number;
//   y: number;
// }

// export interface Product {
//   assetCode: string;
//   name: string;
// }

// const API_BASE_URL = "http://localhost:5000/api";

// interface AssetManagerProps {
//   selectedSite: string;
//   selectedFloor: string;
//   selectedDepartment: string;
//   userName: string;
//   placedAssets: AssetType[];
//   setPlacedAssets: (assets: AssetType[]) => void;
//   children: (handlers: {
//     printerAssets: Product[];
//     upsAssets: Product[];
//     switchAssets: Product[];
//     notebookAssets: Product[];
//     phoneAssets: Product[];
//     computerAssets: Product[];
//     handleDragEnd: (id: string, x: number, y: number) => void;
//     handleDeleteAsset: (asset: AssetType) => void;
//     handleAddAsset: (name: string, assetCode?: string) => void;
//   }) => JSX.Element;
// }

// const AssetManager: React.FC<AssetManagerProps> = ({
//   selectedSite,
//   selectedFloor,
//   selectedDepartment,
//   userName,
//   placedAssets,
//   setPlacedAssets,
//   children,
// }) => {
//   const [printerAssets, setPrinterAssets] = useState<Product[]>([]);
//   const [upsAssets, setUPSAssets] = useState<Product[]>([]);
//   const [switchAssets, setSwitchAssets] = useState<Product[]>([]);
//   const [notebookAssets, setNotebookAssets] = useState<Product[]>([]);
//   const [phoneAssets, setPhoneAssets] = useState<Product[]>([]);
//   const [computerAssets, setComputerAssets] = useState<Product[]>([]);

//   const getAuthConfig = () => {
//     const token = localStorage.getItem("token");
//     return {
//       headers: { Authorization: `Bearer ${token}` }
//     };
//   };

//   useEffect(() => {
//     const fetchAssetsByType = async (type: number, setter: React.Dispatch<React.SetStateAction<Product[]>>) => {
//       try {
//         const res = await axios.get(`${API_BASE_URL}/products/type/${type}`, getAuthConfig());
//         const mapped: Product[] = res.data.map((p: any) => ({
//           assetCode: p.assetCode,
//           name: p.prodName,
//         }));
//         setter(mapped);
//       } catch (err) {
//         console.error(`Error fetching assets type ${type}:`, err);
//       }
//     };

//     fetchAssetsByType(42, setPrinterAssets);
//     fetchAssetsByType(2, setUPSAssets);
//     fetchAssetsByType(12, setSwitchAssets);
//     fetchAssetsByType(22, setNotebookAssets);
//     fetchAssetsByType(50, setPhoneAssets);
//     fetchAssetsByType(1, setComputerAssets);
//   }, []);

//   useEffect(() => {
//     const fetchAssetPositions = async () => {
//       if (!selectedFloor) return;
//       try {
//         const res = await axios.get(`${API_BASE_URL}/positions/${selectedFloor}`, getAuthConfig());
//         const mapped: AssetType[] = res.data.map((a: any) => ({
//           id: a.assetCode,
//           type: a.typeName as AssetType["type"],
//           name: a.typeName,
//           assetCode: a.assetCode,
//           x: a.posX,
//           y: a.posY,
//         }));
//         setPlacedAssets(mapped);
//       } catch (err) {
//         console.error("Error fetching asset positions:", err);
//       }
//     };

//     fetchAssetPositions();
//   }, [selectedFloor]);

//   const updateAssetPosition = async (asset: AssetType) => {
//     try {
//       await axios.post(
//         `${API_BASE_URL}/positions/update`,
//         {
//           AssetCode: asset.assetCode,
//           Floor: selectedFloor,
//           PosX: asset.x,
//           PosY: asset.y,
//           UpdatedBy: userName || "Unknown",
//         },
//         getAuthConfig()
//       );
//       console.log("Updated asset position in MongoDB:", asset.assetCode);
//     } catch (err) {
//       console.error("Update position failed:", err);
//     }
//   };

//   const handleDragEnd = (id: string, x: number, y: number) => {
//     const updated = placedAssets.map(a => a.id === id ? { ...a, x, y } : a);
//     setPlacedAssets(updated);
//     const moved = updated.find(a => a.id === id);
//     if (moved) updateAssetPosition(moved);
//   };

//   const handleAddAsset = async (name: string, assetCode?: string) => {
//     if (!assetCode) return;

//     const type = name as AssetType["type"];
//     const newAsset: AssetType = {
//       id: assetCode,
//       type,
//       name,
//       assetCode,
//       x: 50,
//       y: 50,
//     };

//     try {
//       const res = await axios.post(
//         `${API_BASE_URL}/positions/add`,
//         {
//           AssetCode: newAsset.assetCode,
//           Floor: selectedFloor,
//           PosX: newAsset.x,
//           PosY: newAsset.y,
//           UpdatedBy: userName || "Unknown",
//           TypeName: name
//         },
//         getAuthConfig()
//       );

//       setPlacedAssets([...placedAssets, {
//         ...newAsset,
//         x: res.data.posX,
//         y: res.data.posY,
//       }]);
//       console.log("Successfully added asset to MongoDB:", assetCode);

//     } catch (err: any) {
//       if (err.response?.status === 409) {
//         alert("อุปกรณ์นี้ถูกวางไว้ในแผนผังแล้ว");
//       } else {
//         alert("เกิดข้อผิดพลาดในการเพิ่มอุปกรณ์ลงฐานข้อมูล");
//         console.error(err);
//       }
//     }
//   };
  
//   const handleDeleteAsset = async (asset: AssetType) => {
//     const confirmed = window.confirm(`ยืนยันการลบอุปกรณ์รหัส : ${asset.assetCode} ?`);
//     if (!confirmed) return;
//     try {
//       await axios.post(
//         `${API_BASE_URL}/positions/delete`,
//         { AssetCode: asset.assetCode },
//         getAuthConfig()
//       );
//       setPlacedAssets(placedAssets.filter(a => a.id !== asset.id));
//     } catch (err) {
//       console.error("Delete failed:", err);
//     }
//   };

//   return children({
//     printerAssets,
//     upsAssets,
//     switchAssets,
//     notebookAssets,
//     phoneAssets,
//     computerAssets,
//     handleDragEnd,
//     handleDeleteAsset,
//     handleAddAsset
//   });
// };

// export default AssetManager;
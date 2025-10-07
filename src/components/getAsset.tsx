import { useEffect } from "react";
import axios from "axios";

export interface AssetType {
  id: string;
  type: "Computer" | "Printer" | "UPS" | "Switch" | "Table";
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

interface FetchAssetProps {
  setPrinterAssets: (data: Product[]) => void;
  setUPSAssets: (data: Product[]) => void;
  setSwitchAsset: (data: Product[]) => void;
  setComputerAsset: (data: Product[]) => void;
  setPlacedAssetsByFloor: (data: Record<string, AssetType[]>) => void;
}

const GetAsset: React.FC<FetchAssetProps> = ({
  setPrinterAssets,
  setUPSAssets,
  setSwitchAsset,
  setComputerAsset,
  setPlacedAssetsByFloor,
}) => {
  useEffect(() => {
    // Fetch Computer
    const fetchComputer = async () => {
      try{
        const response = await axios.get<ApiProduct[]>(
          "https://ratiphong.tips.co.th:7112/api/Product/type/1",
          { withCredentials: true }
        );
        const mappedComputer: Product[] = response.data.map((p) => ({
          assetCode: p.assetCode || p.serial,
          name: p.prodName,
        }));
        setComputerAsset(mappedComputer);
      }catch(err){
        console.error("Error fetching UPS assets:", err);
      }
    };

    // Fetch UPS
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

    // Fetch Printer
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

    // Fetch Switch
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
          >(`https://ratiphong.tips.co.th:7112/api/AssetPosition/${floor}`, {
            withCredentials: true,
          });

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
    fetchComputer();
    fetchSwitch();
  }, []);

  return null;
};

export default GetAsset;
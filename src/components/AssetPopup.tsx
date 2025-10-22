import { Label, Tag, Text } from "react-konva";
import { ApiProduct, AssetType } from "./AssetManager";

interface AssetPopupProps {
  asset: AssetType;
  details: ApiProduct;
  onClose: () => void;
}

const AssetPopup = ({ asset, details, onClose }: AssetPopupProps) => {
  const POPUP_WIDTH = 250;
  const POPUP_HEIGHT = 120;
  const STAGE_WIDTH = 1400;
  const STAGE_HEIGHT = 900;

  // คำนวณตำแหน่งเริ่มต้นของ popup
  let popupX = asset.x + 40; // ด้านขวาของ asset
  let popupY = asset.y;

  // ตรวจขอบขวา - ถ้าเลย stage ให้แสดงทางซ้ายแทน
  if (popupX + POPUP_WIDTH > STAGE_WIDTH) {
    popupX = asset.x - POPUP_WIDTH - 20;
  }

  // ตรวจขอบล่าง
  if (popupY + POPUP_HEIGHT > STAGE_HEIGHT) {
    popupY = STAGE_HEIGHT - POPUP_HEIGHT - 10;
  }

  // ตรวจขอบบน
  if (popupY < 10) {
    popupY = 10;
  }

  // ตรวจขอบซ้าย
  if (popupX < 10) {
    popupX = 10;
  }

  const infoText = [
    `Asset Code: ${details.assetCode || "N/A"}`,
    `Name: ${details.prodName}`,
    `Description: ${details.prodDesc}`,
    `IP Address: ${details.ip || "N/A"}`,
    `Serial No: ${details.serial || "N/A"}`,
  ].join("\n");

  return (
    <Label x={popupX} y={popupY}>
      <Tag
        fill="#f0f0f0"
        stroke="black"
        strokeWidth={1}
        lineJoin="round"
        shadowColor="black"
        shadowBlur={10}
        shadowOpacity={0.5}
        shadowOffsetX={5}
        shadowOffsetY={5}
        pointerDirection="left"
        pointerWidth={10}
        pointerHeight={10}
        cornerRadius={5}
      />
      <Text
        text={infoText}
        fontSize={12}
        padding={10}
        fill="black"
        width={POPUP_WIDTH}
      />
      {/* ปุ่มปิด Pop-up */}
      <Text
        text="X"
        fontSize={12}
        fill="red"
        x={POPUP_WIDTH - 15}
        y={5}
        padding={5}
        onClick={onClose}
        onTap={onClose}
        fontStyle="bold"
      />
    </Label>
  );
};

export default AssetPopup;
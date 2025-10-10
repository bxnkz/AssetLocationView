import { Label, Tag, Text } from "react-konva";
import { ApiProduct } from "./AssetManager";
import { AssetType } from "./AssetManager";

interface AssetPopupProps {
  asset: AssetType;
  details: ApiProduct;
  onClose: () => void;
}

const AssetPopup = ({ asset, details, onClose }: AssetPopupProps) => {
  const popupX = asset.x + 40;
  const popupY = asset.y;

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
      />
      {/* ปุ่มปิด Pop-up */}
      <Text
        text="X"
        fontSize={12}
        fill="red"
        x={170}
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
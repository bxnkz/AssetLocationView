import { Image as KonvaImage, Text, Group, Rect } from "react-konva";
import useImage from "use-image";

const assetImages: Record<string, string> = {
  Table: "/assets/table.png",
  Printer: "/assets/printer.png",
  UPS: "/assets/ups.png",
  Switch: "/assets/hub.png",
  Computer: "/assets/computer.png",
};

interface AssetImageProps {
  id: string;
  type: "Table" | "Printer" | "UPS" | "Switch" | "Computer";
  assetCode?: string;
  name: string;
  x: number;
  y: number;
  width?: number; // ขนาดปรับได้
  height?: number;
  onDragEnd: (id: string, x: number, y: number) => void;
  onDelete?: () => void; // callback สำหรับลบ asset
}

const AssetImage = ({
  id,
  type,
  x,
  y,
  width = 35,
  height = 35,
  onDragEnd,
  assetCode,
  name,
  onDelete,
}: AssetImageProps) => {
  const [image] = useImage(assetImages[type] || assetImages["Table"]); // default Table

  return (
    <Group
      x={x}
      y={y}
      draggable
      onDragEnd={(e) => onDragEnd(id, e.target.x(), e.target.y())}
    >
      {/* รูป asset */}
      <KonvaImage image={image} width={width} height={height} />

      {/* ปุ่มลบ */}
      <Group
        x={width - 12} // มุมขวาบน
        y={-8}
        onClick={() => onDelete?.()}
      >
        <Rect width={16} height={16} fill="red" cornerRadius={4} shadowBlur={2} />
        <Text
          text="X"
          fontSize={8}
          fill="white"
          align="center"
          verticalAlign="middle"
          width={16}
          height={16}
        />
      </Group>

      {/* ข้อความชื่อ/assetCode */}
      <Text
        text={assetCode || name}
        y={height + 3}
        width={50}
        x={width/2 - 25}
        align="center"
        fontSize={7}
        fill="black"
      />
    </Group>
  );
};

export default AssetImage;
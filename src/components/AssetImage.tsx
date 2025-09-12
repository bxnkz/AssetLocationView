import { Image as KonvaImage, Text, Group } from "react-konva";
import useImage from "use-image";

const assetImages: Record<string, string> = {
  Table: "/assets/table.png",
  Printer: "/assets/printer.png",
  UPS: "/assets/ups.png",
  Switch: "/assets/hub.png",
};

interface AssetImageProps {
  id: string;
  assetCode?: string;
  name: string;
  x: number;
  y: number;
  onDragEnd: (id: string, x: number, y: number) => void;
}

const AssetImage = ({ id, name, x, y, onDragEnd, assetCode }: AssetImageProps) => {
  const [image] = useImage(assetImages[name]);
  return (
    <Group
      x={x}
      y={y}
      draggable
      onDragEnd={(e) => onDragEnd(id, e.target.x(), e.target.y())}
    >
      <KonvaImage image={image} width={50} height={50} />
      {assetCode && (
        <Text
          text={assetCode}
          y={55}
          width={50}
          align="center"
          fontSize={9}
          fill="black"
        />
      )}
    </Group>
  );
};

export default AssetImage;

import { Image as KonvaImage } from "react-konva";
import useImage from "use-image";

const assetImages: Record<string, string> = {
  Table: "/assets/table.png",
  Printer: "/assets/printer.png",
  UPS: "/assets/ups.png",
  Switch: "/assets/hub.png",
};

interface AssetImageProps {
  name: string;
  x: number;
  y: number;
  onDragEnd: (name: string, x: number, y: number) => void;
}

const AssetImage = ({ name, x, y, onDragEnd }: AssetImageProps) => {
  const [image] = useImage(assetImages[name]);
  return (
    <KonvaImage
      image={image}
      x={x}
      y={y}
      width={50}
      height={50}
      draggable
      onDragEnd={(e) => onDragEnd(name, e.target.x(), e.target.y())}
    />
  );
};

export default AssetImage;

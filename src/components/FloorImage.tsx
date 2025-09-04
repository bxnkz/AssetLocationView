import { Image as KonvaImage } from "react-konva";
import useImage from "use-image";

interface FloorImageProps {
  src: string;
}

const FloorImage = ({ src }: FloorImageProps) => {
  const [image] = useImage(src);
  return <KonvaImage image={image} width={800} height={600} />;
};

export default FloorImage;

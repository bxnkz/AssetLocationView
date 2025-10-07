import { Image as KonvaImage } from "react-konva";
import useImage from "use-image";

interface FloorImageProps {
  selectedSite: string;
  selectedFloor: string;
  selectedDepartment: string;
}

const FloorImage = ({
  selectedSite,
  selectedFloor,
  selectedDepartment,
}: FloorImageProps) => {
  const getImageSrc = () => {
    return `/img/TIPS_${selectedSite}_${selectedFloor}.png`;
  };

  
  const src = getImageSrc();
  const [image] = useImage(src);

  return <KonvaImage image={image} width={800} height={600} />;
};

export default FloorImage;
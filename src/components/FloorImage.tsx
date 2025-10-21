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

  return <KonvaImage image={image} width={1362} height={890} />;
};

export default FloorImage;
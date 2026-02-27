// src/components/LayoutPreview.tsx
import LayoutPreviewGrid from "./LayoutPreviewGrid";

interface Props {
  title: string;
  desks: any[];
  onSelect: () => void;
}

const LayoutPreview = ({ title, desks, onSelect }: Props) => {
  return (
    <div
      onClick={onSelect}
      className="border rounded-lg p-2 cursor-pointer hover:border-blue-500"
    >
      <div className="text-sm font-bold mb-1">{title}</div>
      <LayoutPreviewGrid desks={desks} />
    </div>
  );
};

export default LayoutPreview;
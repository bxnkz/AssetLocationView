// src/components/LayoutPreview.tsx
import LayoutPreviewGrid from "./LayoutPreviewGrid";
import { LayoutResult } from "../layout/algorithms/layoutGenerator";

interface Props {
  title: string;
  layout: LayoutResult;
  onSelect: () => void;
}

function patternToDesks(layout: LayoutResult) {
  const desks: any[] = [];
  let id = 0;

  for (let r = 0; r < layout.rows; r++) {
    let xOffset = 0;

    for (const group of layout.pattern) {
      for (let i = 0; i < group; i++) {
        desks.push({
          id: id++,
          x: xOffset + i * layout.deskWidth,
          y: r * (layout.deskHeight + layout.spacingY),
          width: layout.deskWidth,
          height: layout.deskHeight,
        });
      }

      xOffset += group * layout.deskWidth + layout.spacingX;
    }
  }

  return desks;
}

const LayoutPreview = ({ title, layout, onSelect }: Props) => {
  const desks = patternToDesks(layout);

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
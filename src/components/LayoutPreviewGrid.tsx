import { useRef, useEffect } from "react";
import { LayoutResult } from "../layout/algorithms/layoutGenerator";

interface Props {
  layout: LayoutResult;
  selected?: boolean;
  onSelect: () => void;
}

const W = 190, H = 130;

export default function LayoutPreviewGrid({ layout, selected, onSelect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);

    const { pattern, rows, deskWidth, deskHeight, spacingX, spacingY, totalDesks, layoutMode } = layout;

    // คำนวณ bounding box เพื่อ scale ให้พอดี preview
    const walkways = layoutMode === "exam" ? 0 : (pattern.length - 1) * spacingX;
    const cols = layoutMode === "exam" ? Math.ceil(totalDesks / rows) : Math.max(...pattern);
    const totalW = cols * deskWidth + walkways;
    const totalH = rows * deskHeight + (rows - 1) * spacingY;
    const scale = Math.min((W - 16) / totalW, (H - 16) / totalH, 28);
    const ox = (W - totalW * scale) / 2;
    const oy = (H - totalH * scale) / 2;
    const dw = deskWidth * scale;
    const dh = deskHeight * scale;

    ctx.fillStyle = selected ? "#006B67" : "#3b82f6";

    let count = 0;
    if (layoutMode === "exam") {
      const perRow = Math.ceil(totalDesks / rows);
      for (let r = 0; r < rows && count < totalDesks; r++)
        for (let c = 0; c < perRow && count < totalDesks; c++, count++)
          ctx.fillRect(ox + c * (dw + spacingX * 0.4 * scale), oy + r * (dh + spacingY * scale), dw, dh);
    } else {
      for (let r = 0; r < rows && count < totalDesks; r++) {
        let xPos = 0;
        for (let p = 0; p < pattern.length && count < totalDesks; p++) {
          for (let g = 0; g < pattern[p] && count < totalDesks; g++, count++)
            ctx.fillRect(ox + (xPos + g * deskWidth) * scale, oy + r * (deskHeight + spacingY) * scale, dw, dh);
          xPos += pattern[p] * deskWidth + (p < pattern.length - 1 ? spacingX : 0);
        }
      }
    }
  }, [layout, selected]);

  return (
    <div onClick={onSelect}
      className={`cursor-pointer rounded-xl border-2 p-2 transition hover:shadow-md
        ${selected ? "border-[#006B67] bg-[#006B67]/5 shadow-md" : "border-gray-200 hover:border-[#006B67]/40 bg-gray-50"}`}>
      <canvas ref={canvasRef} width={W} height={H} className="w-full rounded-lg" />
      <p className={`text-xs font-semibold mt-1.5 px-1 truncate ${selected ? "text-[#006B67]" : "text-gray-700"}`}>
        {layout.name}
      </p>
      <p className="text-xs text-gray-400 px-1">
        {layout.layoutMode === "exam" ? "📝 ห้องสอบ" : `${layout.columns} คอลัมน์ × ${layout.rows} แถว`}
      </p>
    </div>
  );
}
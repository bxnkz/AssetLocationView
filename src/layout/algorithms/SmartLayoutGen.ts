import { generateGrid } from "./grid";
import { generateRowPattern } from "./rowPattern";

export type LayoutAlgorithm = "grid" | "row-pattern";

export type LayoutResult = {
  algorithm: LayoutAlgorithm;
  name: string;
  desks: any[];
};

/* ของเดิม ยังเก็บไว้ได้ */
export function generateLayout(
  algorithm: LayoutAlgorithm,
  config: any,
  startX: number,
  startY: number,
  scale: number
) {
  switch (algorithm) {
    case "row-pattern":
      return generateRowPattern(config, startX, startY, scale);
    case "grid":
    default:
      return generateGrid(config, startX, startY, scale);
  }
}

/* ⭐ ตัวใหม่: generate ทุกแบบ */
export function generateAllLayouts(
  config: any,
  startX: number,
  startY: number,
  scale: number
): LayoutResult[] {
  return [
    {
      algorithm: "grid",
      name: "Grid",
      desks: generateGrid(config, startX, startY, scale),
    },
    {
      algorithm: "row-pattern",
      name: "Row Pattern",
      desks: generateRowPattern(config, startX, startY, scale),
    },
  ];
}
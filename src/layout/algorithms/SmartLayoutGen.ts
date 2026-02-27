import { generateGrid } from "./grid";
import { generateRowPattern } from "./rowPattern";

export type LayoutAlgorithm = "grid" | "row-pattern";

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
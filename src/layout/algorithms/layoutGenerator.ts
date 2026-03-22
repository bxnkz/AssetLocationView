// layoutGenerator.ts
import { LayoutConfig, DEFAULT_SPACING, MAX_COLUMNS } from "../../types";

export interface LayoutResult {
  id: string;
  name: string;
  columns: number;
  rows: number;
  pattern: number[];
  deskWidth: number;
  deskHeight: number;
  spacingX: number;
  spacingY: number;
  totalDesks: number;
  layoutMode: "classroom" | "exam";
}

export type { LayoutConfig };

/** คำนวณความจุสูงสุดของห้อง — classroom mode */
export function calcMaxCapacity(config: Pick<LayoutConfig, "roomWidth"|"roomHeight"|"deskWidth"|"deskHeight"|"spacingX"|"spacingY"|"blackboardDepth">): number {
  const usableH = config.roomHeight - (config.blackboardDepth ?? DEFAULT_SPACING.blackboardDepth);
  if (usableH <= 0) return 0;
  let max = 0;
  for (let g = 1; g <= MAX_COLUMNS; g++) {
    const avW = config.roomWidth - (g - 1) * config.spacingX;
    if (avW <= 0) continue;
    const perRow = Math.floor(avW / config.deskWidth);
    if (perRow <= 0) continue;
    const maxRows = Math.floor((usableH + config.spacingY) / (config.deskHeight + config.spacingY));
    max = Math.max(max, perRow * maxRows);
  }
  return max;
}

/** คำนวณความจุสูงสุดของห้อง — exam mode */
export function calcMaxCapacityExam(config: Pick<LayoutConfig, "roomWidth"|"roomHeight"|"deskWidth"|"deskHeight"|"spacingX"|"spacingY"|"blackboardDepth">): number {
  const usableH = config.roomHeight - (config.blackboardDepth ?? DEFAULT_SPACING.blackboardDepth);
  if (usableH <= 0) return 0;
  const perRow = Math.floor((config.roomWidth + config.spacingX) / (config.deskWidth + config.spacingX));
  if (perRow <= 0) return 0;
  const maxRows = Math.floor((usableH + config.spacingY) / (config.deskHeight + config.spacingY));
  return perRow * maxRows;
}

/** สร้าง exam layout */
function examLayouts(config: LayoutConfig): LayoutResult[] {
  const { roomWidth, roomHeight, deskWidth, deskHeight, totalDesks, spacingX, spacingY } = config;
  const perRow = Math.floor((roomWidth + spacingX) / (deskWidth + spacingX));
  if (perRow <= 0) return [];
  const rows = Math.ceil(totalDesks / perRow);
  if (rows * deskHeight + (rows - 1) * spacingY > roomHeight) return [];
  return [{
    id: "exam-1", name: "ห้องสอบ — เรียงห่าง",
    columns: 1, rows, pattern: [1],
    deskWidth, deskHeight, spacingX, spacingY,
    totalDesks, layoutMode: "exam",
  }];
}

/** สร้าง classroom layouts */
function classroomLayouts(config: LayoutConfig): LayoutResult[] {
  const { roomWidth, roomHeight, deskWidth, deskHeight, totalDesks, spacingX, spacingY } = config;
  const results: LayoutResult[] = [];
  const seen = new Set<string>();

  const minGroups = config.columns ?? 1;
  const maxGroups = config.columns ?? MAX_COLUMNS;

  for (let numGroups = minGroups; numGroups <= maxGroups; numGroups++) {
    const walkwayW = (numGroups - 1) * spacingX;
    const avW = roomWidth - walkwayW;
    if (avW <= 0) continue;
    if (numGroups * deskWidth + walkwayW > roomWidth) continue;

    const minRows = config.rows ?? 1;
    const maxRows = config.rows ?? Math.floor((roomHeight + spacingY) / (deskHeight + spacingY));

    for (let rows = minRows; rows <= maxRows; rows++) {
      if (rows * deskHeight + (rows - 1) * spacingY > roomHeight) break;
      const perRow = Math.ceil(totalDesks / rows);
      const maxPerRow = Math.floor(avW / deskWidth);
      if (perRow > maxPerRow) continue;

      const patterns = getBalancedPatterns(perRow, numGroups, avW, deskWidth);
      for (const pattern of patterns) {
        const totalDeskW = pattern.reduce((sum, g) => sum + g * deskWidth, 0);
        const layoutW = totalDeskW + walkwayW;
        if (layoutW > roomWidth) continue;

        const key = `${numGroups}-${rows}-${pattern.join(",")}`;
        if (seen.has(key)) continue;
        seen.add(key);

        results.push({
          id: `l-${numGroups}g-${rows}r-${pattern.join("-")}`,
          name: `${numGroups} คอลัมน์ | ${rows} แถว [${pattern.join("-")}]`,
          columns: numGroups, rows, pattern,
          deskWidth, deskHeight, spacingX, spacingY,
          totalDesks, layoutMode: "classroom",
        });
      }
    }
  }
  results.sort((a, b) => {
    const ba = Math.max(...a.pattern) - Math.min(...a.pattern);
    const bb = Math.max(...b.pattern) - Math.min(...b.pattern);
    return ba !== bb ? ba - bb : a.columns - b.columns;
  });
  return results.slice(0, 20);
}

function getBalancedPatterns(total: number, groups: number, avW: number, deskWidth: number): number[][] {
  if (groups === 1) return [[total]];
  const maxPerGroup = Math.floor(avW / deskWidth);
  const base = Math.floor(total / groups);
  const remainder = total % groups;
  const patterns: number[][] = [];
  const balanced = Array(groups).fill(base);
  for (let i = 0; i < remainder; i++) balanced[i]++;
  if (balanced.every(g => g <= maxPerGroup && g > 0)) {
    patterns.push([...balanced]);
    const balancedEnd = Array(groups).fill(base);
    for (let i = groups - remainder; i < groups; i++) balancedEnd[i]++;
    if (balancedEnd.join(",") !== balanced.join(",")) patterns.push(balancedEnd);
  }
  return patterns;
}

export function generateLayouts(config: LayoutConfig): LayoutResult[] {
  const sx = Math.max(config.spacingX, DEFAULT_SPACING.MIN_SPACING_X);
  const sy = Math.max(config.spacingY, DEFAULT_SPACING.MIN_SPACING_Y);
  const bd = Math.max(config.blackboardDepth ?? DEFAULT_SPACING.blackboardDepth, DEFAULT_SPACING.MIN_BLACKBOARD_DEPTH);

  const c = {
    ...config,
    spacingX: sx,
    spacingY: sy,
    blackboardDepth: bd,
    roomHeight: config.roomHeight - bd,
  };

  if (c.roomHeight <= 0) return [];
  return config.layoutMode === "exam" ? examLayouts(c) : classroomLayouts(c);
}

/** สร้าง DeskAsset array แบบจัดกึ่งกลางแนวนอน */
export function buildDesksFromLayout(
  layout: LayoutResult,
  stageStartX: number,
  stageStartY: number,
  roomPixelWidth: number,
  scale: number
) {
  const { pattern, rows, deskWidth, deskHeight, spacingX, spacingY, totalDesks, layoutMode } = layout;
  const desks: { id: string; name: string; x: number; y: number; width: number; height: number }[] = [];
  const dw = deskWidth * scale;
  const dh = deskHeight * scale;
  const sx = spacingX * scale;
  const sy = spacingY * scale;
  let count = 0;

  if (layoutMode === "exam") {
    const perRow = Math.floor((roomPixelWidth + sx) / (dw + sx));
    const actualW = (perRow * dw) + ((perRow - 1) * sx);
    const offsetX = (roomPixelWidth - actualW) / 2;

    for (let r = 0; r < rows && count < totalDesks; r++)
      for (let c = 0; c < perRow && count < totalDesks; c++, count++)
        desks.push({ id: `d-${count}`, name: `${count + 1}`,
          x: stageStartX + offsetX + c * (dw + sx),
          y: stageStartY + r * (dh + sy),
          width: dw, height: dh });
  } else {
    const totalDesksInRow = pattern.reduce((sum, g) => sum + g, 0);
    const actualW = (totalDesksInRow * dw) + ((pattern.length - 1) * sx);
    const offsetX = (roomPixelWidth - actualW) / 2;

    for (let r = 0; r < rows && count < totalDesks; r++) {
      let xOff = 0;
      for (let p = 0; p < pattern.length && count < totalDesks; p++) {
        for (let g = 0; g < pattern[p] && count < totalDesks; g++, count++)
          desks.push({ id: `d-${count}`, name: `${count + 1}`,
            x: stageStartX + offsetX + (xOff + g * deskWidth) * scale,
            y: stageStartY + r * (deskHeight + spacingY) * scale,
            width: dw, height: dh });
        xOff += pattern[p] * deskWidth + (p < pattern.length - 1 ? spacingX : 0);
      }
    }
  }
  return desks;
}
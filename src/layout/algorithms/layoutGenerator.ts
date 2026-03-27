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

/** คำนวณความจุสูงสุดของห้อง — classroom mode
 *  บังคับ: อย่างน้อย 2 groups (1 ทางเดิน) และแต่ละ group ต้องมี >= 2 โต๊ะ */
export function calcMaxCapacity(config: Pick<LayoutConfig, "roomWidth"|"roomHeight"|"deskWidth"|"deskHeight"|"spacingX"|"spacingY"|"blackboardDepth">): number {
  const usableH = config.roomHeight - (config.blackboardDepth ?? DEFAULT_SPACING.blackboardDepth);
  if (usableH <= 0) return 0;
  let max = 0;
  for (let g = 2; g <= MAX_COLUMNS; g++) {
    const walkwayW = (g - 1) * config.spacingX;
    const avW = config.roomWidth - walkwayW;
    if (avW <= 0) continue;
    // โต๊ะต่อ group = avW หารด้วย g แล้ว floor (แบ่งเท่าๆ กัน)
    const desksPerGroup = Math.floor(avW / g / config.deskWidth);
    if (desksPerGroup < 2) continue;   // ห้ามมี group ที่มีโต๊ะ < 2
    const perRow = desksPerGroup * g;
    const maxRows = Math.floor((usableH + config.spacingY) / (config.deskHeight + config.spacingY));
    max = Math.max(max, perRow * maxRows);
  }
  return max;
}

/** คำนวณความจุสูงสุดของห้อง — exam mode */
export function calcMaxCapacityExam(config: Pick<LayoutConfig, "roomWidth"|"roomHeight"|"deskWidth"|"deskHeight"|"spacingX"|"spacingY"|"blackboardDepth">): number {
  const usableH = config.roomHeight - (config.blackboardDepth ?? DEFAULT_SPACING.examBlackboardDepth);
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

  const minGroups = config.columns ?? 2;
  const maxGroups = config.columns ?? MAX_COLUMNS;

  for (let numGroups = minGroups; numGroups <= maxGroups; numGroups++) {
    const walkwayW = (numGroups - 1) * spacingX;
    const avW = roomWidth - walkwayW;
    if (avW <= 0) continue;
    if (numGroups * deskWidth + walkwayW > roomWidth) continue;

    // แต่ละ group ต้องจุได้อย่างน้อย 2 โต๊ะ (ตรวจจากพื้นที่เฉลี่ยต่อ group)
    const maxPerGroupByWidth = Math.floor(avW / numGroups / deskWidth);
    if (maxPerGroupByWidth < 2) continue;

    const minRows = config.rows ?? 1;
    const maxRows = config.rows ?? Math.floor((roomHeight + spacingY) / (deskHeight + spacingY));

    for (let rows = minRows; rows <= maxRows; rows++) {
      if (rows * deskHeight + (rows - 1) * spacingY > roomHeight) break;

      // fullRowDesks = โต๊ะต่อแถวปกติ (แถว 1 ถึง rows-1)
      // lastRowDesks = โต๊ะแถวสุดท้าย (อาจน้อยกว่าถ้าเป็นเศษ)
      const fullRowDesks = Math.ceil(totalDesks / rows);
      const lastRowDesks = totalDesks - fullRowDesks * (rows - 1);
      if (lastRowDesks <= 0) continue;

      const maxPerRow = Math.floor(avW / deskWidth);
      if (fullRowDesks > maxPerRow) continue;

      // แถวปกติ: ทุก group >= 2 โต๊ะ
      const fullPatterns = getBalancedPatterns(fullRowDesks, numGroups, avW, deskWidth, 2);
      if (fullPatterns.length === 0) continue;

      for (const fp of fullPatterns) {
        const totalDeskW = fp.reduce((sum, g) => sum + g * deskWidth, 0);
        const layoutW = totalDeskW + walkwayW;
        if (layoutW > roomWidth) continue;

        const key = `${numGroups}-${rows}-${fp.join(",")}`;
        if (seen.has(key)) continue;
        seen.add(key);

        results.push({
          id: `l-${numGroups}g-${rows}r-${fp.join("-")}`,
          name: `${numGroups - 1} ทางเดิน | [${fp.join("-")}]`,
          columns: numGroups, rows, pattern: fp,
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

/**
 * สร้าง balanced patterns สำหรับ total โต๊ะใน groups กลุ่ม
 * @param minPerGroup  2 = แถวปกติ (ห้ามมี group ที่มีโต๊ะ < 2)
 *                     1 = แถวเศษสุดท้าย (บาง group อาจมี 1 โต๊ะได้)
 */
function getBalancedPatterns(
  total: number,
  groups: number,
  avW: number,
  deskWidth: number,
  minPerGroup: number = 2
): number[][] {
  if (groups === 1) return total >= minPerGroup ? [[total]] : [];
  const maxPerGroup = Math.floor(avW / deskWidth);
  const base = Math.floor(total / groups);
  if (base < minPerGroup) return [];
  const remainder = total % groups;
  const patterns: number[][] = [];

  // pattern A: เศษกระจายไว้หน้า
  const pA = Array(groups).fill(base);
  for (let i = 0; i < remainder; i++) pA[i]++;
  if (pA.every((g: number) => g >= minPerGroup && g <= maxPerGroup)) {
    patterns.push([...pA]);
  }

  // pattern B: เศษกระจายไว้หลัง
  const pB = Array(groups).fill(base);
  for (let i = groups - remainder; i < groups; i++) pB[i]++;
  if (pB.join(",") !== pA.join(",") && pB.every((g: number) => g >= minPerGroup && g <= maxPerGroup)) {
    patterns.push([...pB]);
  }

  return patterns;
}

export function generateLayouts(config: LayoutConfig): LayoutResult[] {
  const sx = Math.max(config.spacingX, DEFAULT_SPACING.MIN_SPACING_X);
  const sy = Math.max(config.spacingY, DEFAULT_SPACING.MIN_SPACING_Y);

  // exam: min = 0 (ไม่บังคับ), classroom: min = 1.5m
  const minBd = config.layoutMode === "exam"
    ? DEFAULT_SPACING.MIN_EXAM_BLACKBOARD_DEPTH
    : DEFAULT_SPACING.MIN_BLACKBOARD_DEPTH;
  const bd = Math.max(config.blackboardDepth ?? DEFAULT_SPACING.blackboardDepth, minBd);

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
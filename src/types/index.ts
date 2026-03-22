export const DEFAULT_SPACING = {
  spacingX: 0.5,              // ระยะห่างระหว่าง column (m) — วัดจากสถานที่จริง
  spacingY: 0.9,              // ระยะห่างระหว่างแถว (m) — วัดจากสถานที่จริง
  MIN_SPACING_X: 0.5,
  MIN_SPACING_Y: 0.9,
  blackboardDepth: 3.6,       // พื้นที่หน้ากระดาน classroom default (m)
  MIN_BLACKBOARD_DEPTH: 1.5,  // ขั้นต่ำบังคับ classroom
  examBlackboardDepth: 0,     // พื้นที่หน้ากระดาน exam default (m)
  MIN_EXAM_BLACKBOARD_DEPTH: 0, // ห้องสอบไม่บังคับขั้นต่ำ
};

export const MAX_COLUMNS = 6;
export const SCALE = 60;
export const STAGE_WIDTH = 1100;
export const STAGE_HEIGHT = 680;

export interface LayoutConfig {
  roomWidth: number;
  roomHeight: number;
  deskWidth: number;
  deskHeight: number;
  totalDesks: number;
  spacingX: number;
  spacingY: number;
  blackboardDepth: number;
  layoutMode: "classroom" | "exam";
  columns?: number;
  rows?: number;
}
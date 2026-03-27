import { useState, useEffect } from "react";
import { LayoutConfig, DEFAULT_SPACING, MAX_COLUMNS } from "../types";
import { calcMaxCapacity, calcMaxCapacityExam } from "../layout/algorithms/layoutGenerator";

interface AutoGenProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (config: LayoutConfig) => void;
}

// classroom defaults
const CLASSROOM_DEFAULTS: LayoutConfig = {
  roomWidth: 10,
  roomHeight: 8,
  deskWidth: 1.5,   // วัดจากสถานที่จริง
  deskHeight: 0.6,  // วัดจากสถานที่จริง
  totalDesks: 30,
  spacingX: DEFAULT_SPACING.spacingX,
  spacingY: DEFAULT_SPACING.spacingY,
  blackboardDepth: DEFAULT_SPACING.blackboardDepth,
  layoutMode: "classroom",
};

// exam defaults — blackboardDepth เริ่มที่ 0
const EXAM_DEFAULTS: LayoutConfig = {
  ...CLASSROOM_DEFAULTS,
  blackboardDepth: DEFAULT_SPACING.examBlackboardDepth,
  layoutMode: "exam",
};

const AutoGen = ({ isOpen, onClose, onGenerate }: AutoGenProps) => {
  const [config, setConfig] = useState<LayoutConfig>(CLASSROOM_DEFAULTS);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // ล้าง state เมื่อเปิด modal
  useEffect(() => {
    if (isOpen) { /* reset ถ้าจำเป็น */ }
  }, [isOpen]);

  // อัปเดต totalDesks เป็น maxCap อัตโนมัติ เมื่อพารามิเตอร์ที่เกี่ยวข้องเปลี่ยน
  useEffect(() => {
    const { roomWidth, roomHeight, deskWidth, deskHeight } = config;
    if (!roomWidth || !roomHeight || !deskWidth || !deskHeight) return;
    const cap = config.layoutMode === "exam"
      ? calcMaxCapacityExam(config)
      : calcMaxCapacity(config);
    if (cap > 0) {
      setConfig(prev => ({ ...prev, totalDesks: cap }));
    }
  }, [
    config.roomWidth, config.roomHeight,
    config.deskWidth, config.deskHeight,
    config.spacingX, config.spacingY,
    config.blackboardDepth, config.layoutMode,
  ]);

  // เมื่อเปลี่ยน mode — อัปเดต blackboardDepth ให้ตรง default ของ mode นั้น
  const handleModeChange = (mode: "classroom" | "exam") => {
    setConfig(prev => ({
      ...prev,
      layoutMode: mode,
      blackboardDepth: mode === "exam"
        ? DEFAULT_SPACING.examBlackboardDepth
        : DEFAULT_SPACING.blackboardDepth,
    }));
  };

  if (!isOpen) return null;

  const set = (key: keyof LayoutConfig, value: number | string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleChange = (key: keyof LayoutConfig, raw: string) => {
    const num = parseFloat(raw);
    if (isNaN(num)) return;
    if (key === "spacingX") { set(key, Math.max(num, DEFAULT_SPACING.MIN_SPACING_X)); return; }
    if (key === "spacingY") { set(key, Math.max(num, DEFAULT_SPACING.MIN_SPACING_Y)); return; }
    if (key === "blackboardDepth") {
      const minBd = config.layoutMode === "exam"
        ? DEFAULT_SPACING.MIN_EXAM_BLACKBOARD_DEPTH
        : DEFAULT_SPACING.MIN_BLACKBOARD_DEPTH;
      set(key, Math.max(num, minBd));
      return;
    }
    set(key, Math.max(num, 0));
  };

  const handleGenerate = () => {
    const { roomWidth, roomHeight, deskWidth, deskHeight, totalDesks } = config;
    if (!roomWidth || !roomHeight || !deskWidth || !deskHeight || !totalDesks) {
      alert("กรุณากรอกข้อมูลให้ครบ"); return;
    }
    if (totalDesks <= 0) { alert("จำนวนโต๊ะต้องมากกว่า 0"); return; }
    onGenerate(config);
  };

  const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B67]/30 focus:border-[#006B67]";

  const maxCap = config.roomWidth && config.roomHeight && config.deskWidth && config.deskHeight
    ? (config.layoutMode === "exam" ? calcMaxCapacityExam(config) : calcMaxCapacity(config))
    : null;

  const minBd = config.layoutMode === "exam"
    ? DEFAULT_SPACING.MIN_EXAM_BLACKBOARD_DEPTH
    : DEFAULT_SPACING.MIN_BLACKBOARD_DEPTH;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-2xl w-[380px] shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">

        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg text-gray-800">สร้างแผนผังอัตโนมัติ</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Mode */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: "classroom", label: "ห้องเรียน", icon: "bi-building",      desc: "จัดช่อง มีทางเดิน" },
            { value: "exam",      label: "ห้องสอบ",   icon: "bi-journal-text",  desc: "เรียงห่าง ตัวละ 1" },
          ].map(m => (
            <button key={m.value} onClick={() => handleModeChange(m.value as "classroom" | "exam")}
              className={`flex flex-col items-center p-3 rounded-xl border-2 transition text-center
                ${config.layoutMode === m.value ? "border-[#006B67] bg-[#006B67]/5" : "border-gray-200 hover:border-gray-300"}`}>
              <i className={`bi ${m.icon} text-xl mb-1 ${config.layoutMode === m.value ? "text-[#006B67]" : "text-gray-500"}`}></i>
              <span className={`text-sm font-semibold ${config.layoutMode === m.value ? "text-[#006B67]" : "text-gray-700"}`}>{m.label}</span>
              <span className="text-xs text-gray-400">{m.desc}</span>
            </button>
          ))}
        </div>

        {/* ขนาดห้อง — กว้าง + ยาว แถวเดียวกัน */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">ขนาดห้อง (เมตร)</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">กว้าง</span>
              <input type="number" min="0.1" step="0.1"
                value={config.roomWidth ?? ""}
                onChange={e => handleChange("roomWidth", e.target.value)}
                className="w-full border border-gray-200 rounded-lg pl-11 pr-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B67]/30 focus:border-[#006B67]" />
            </div>
            <span className="text-gray-400 text-sm shrink-0">×</span>
            <div className="flex-1 relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">ยาว</span>
              <input type="number" min="0.1" step="0.1"
                value={config.roomHeight ?? ""}
                onChange={e => handleChange("roomHeight", e.target.value)}
                className="w-full border border-gray-200 rounded-lg pl-9 pr-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B67]/30 focus:border-[#006B67]" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <i className="bi bi-lightbulb text-amber-400 text-xs"></i>
            <span className="text-xs text-gray-400">ใช้บ่อย:</span>
            {[{ w: 8.1, h: 8.1, label: "8.1 × 8.1" }].map(p => (
              <button key={p.label} type="button"
                onClick={() => { set("roomWidth", p.w); set("roomHeight", p.h); }}
                className={`text-xs px-2 py-0.5 rounded-full border transition
                  ${config.roomWidth === p.w && config.roomHeight === p.h
                    ? "bg-[#006B67] text-white border-[#006B67]"
                    : "border-gray-200 text-[#006B67] hover:border-[#006B67]/50 hover:bg-[#006B67]/5"}`}>
                {p.label} ม.
              </button>
            ))}
          </div>
        </div>

        {/* ขนาดโต๊ะ — กว้าง + ยาว แถวเดียวกัน */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">ขนาดโต๊ะ (เมตร)</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">กว้าง</span>
              <input type="number" min="0.1" step="0.1"
                value={config.deskWidth ?? ""}
                onChange={e => handleChange("deskWidth", e.target.value)}
                className="w-full border border-gray-200 rounded-lg pl-11 pr-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B67]/30 focus:border-[#006B67]" />
            </div>
            <span className="text-gray-400 text-sm shrink-0">×</span>
            <div className="flex-1 relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">ยาว</span>
              <input type="number" min="0.1" step="0.1"
                value={config.deskHeight ?? ""}
                onChange={e => handleChange("deskHeight", e.target.value)}
                className="w-full border border-gray-200 rounded-lg pl-9 pr-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006B67]/30 focus:border-[#006B67]" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <i className="bi bi-lightbulb text-amber-400 text-xs"></i>
            <span className="text-xs text-gray-400">ใช้บ่อย:</span>
            {[
              { w: 1.5, h: 0.6, label: "1.5 × 0.6 คอม",      modes: ["classroom"] },
              { w: 0.8, h: 0.6, label: "0.8 × 0.6 เลคเชอร์", modes: ["classroom", "exam"] },
            ].filter(p => p.modes.includes(config.layoutMode)).map(p => (
              <button key={p.label} type="button"
                onClick={() => { set("deskWidth", p.w); set("deskHeight", p.h); }}
                className={`text-xs px-2 py-0.5 rounded-full border transition
                  ${config.deskWidth === p.w && config.deskHeight === p.h
                    ? "bg-[#006B67] text-white border-[#006B67]"
                    : "border-gray-200 text-[#006B67] hover:border-[#006B67]/50 hover:bg-[#006B67]/5"}`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* จำนวนโต๊ะ — step="1" เพราะเป็นจำนวนเต็ม, max = ความจุสูงสุด */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            จำนวนโต๊ะที่ต้องการวาง
            {maxCap !== null && (
              <span className="text-xs text-gray-400 ml-1">(สูงสุด {maxCap} ตัว)</span>
            )}
          </label>
          <input type="number" min="1" step="1"
            max={maxCap ?? undefined}
            value={config.totalDesks ?? ""}
            onChange={e => {
              const v = parseInt(e.target.value);
              if (!isNaN(v) && v >= 1) {
                set("totalDesks", maxCap !== null ? Math.min(v, maxCap) : v);
              }
            }}
            className={inputClass} />
          {maxCap !== null && (
            <p className="text-xs text-[#006B67]">
              ความจุสูงสุด: <span className="font-bold">{maxCap} ตัว</span>
              {config.totalDesks < maxCap && (
                <button
                  type="button"
                  onClick={() => set("totalDesks", maxCap)}
                  className="ml-2 underline hover:text-[#005a56]"
                >
                  ใช้ค่าสูงสุด
                </button>
              )}
            </p>
          )}
        </div>


        {/* Advanced toggle */}
        <button onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1 text-sm text-[#006B67] font-medium hover:underline">
          <i className={`bi bi-chevron-${showAdvanced ? "up" : "down"}`}></i>
          การตั้งค่าขั้นสูง
        </button>

        {showAdvanced && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
            <p className="text-xs text-amber-700">⚙️ ค่าเริ่มต้นจากมาตรฐานพื้นที่จริง — แก้ได้แต่ห้ามต่ำกว่าขั้นต่ำ</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  ระยะห่างทางคอลัมน์ (เมตร)
                  <span className="text-xs text-gray-400 ml-1">ต่ำสุด {DEFAULT_SPACING.MIN_SPACING_X}</span>
                </label>
                <input type="number" min={DEFAULT_SPACING.MIN_SPACING_X} step="0.1"
                  value={config.spacingX}
                  onChange={e => handleChange("spacingX", e.target.value)}
                  className={inputClass} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  ระยะห่างระหว่างแถว (เมตร)
                  <span className="text-xs text-gray-400 ml-1">ต่ำสุด {DEFAULT_SPACING.MIN_SPACING_Y}</span>
                </label>
                <input type="number" min={DEFAULT_SPACING.MIN_SPACING_Y} step="0.1"
                  value={config.spacingY}
                  onChange={e => handleChange("spacingY", e.target.value)}
                  className={inputClass} />
              </div>
            </div>

            {config.layoutMode === "classroom" && (() => {
              const { roomWidth, deskWidth, spacingX, totalDesks } = config;

              /**
               * หา maxCols จริงที่ generator จะผ่านได้ โดยต้องผ่าน 3 เงื่อนไขพร้อมกัน:
               * 1. numGroups * deskWidth + (numGroups-1) * spacingX <= roomWidth  (พื้นที่ห้อง)
               * 2. floor(avW / numGroups / deskWidth) >= 2  (แต่ละ group จุได้ >= 2 โต๊ะ)
               * 3. floor(totalDesks / numGroups) >= 2  (โต๊ะเฉลี่ยต่อ group >= 2)
               */
              let maxCols = 1;
              if (roomWidth && deskWidth && spacingX && totalDesks) {
                for (let g = MAX_COLUMNS; g >= 2; g--) {
                  const walkwayW = (g - 1) * spacingX;
                  const avW = roomWidth - walkwayW;
                  if (avW <= 0) continue;
                  if (g * deskWidth + walkwayW > roomWidth) continue;           // เงื่อนไข 1
                  if (Math.floor(avW / g / deskWidth) < 2) continue;            // เงื่อนไข 2
                  if (Math.floor(totalDesks / g) < 2) continue;                 // เงื่อนไข 3
                  maxCols = g;
                  break;
                }
              }
              const maxWalkways = Math.max(1, maxCols - 1);

              // clamp columns ที่เลือกไว้ถ้าเกิน max ใหม่
              const walkwaysVal = config.columns !== undefined
                ? Math.min(config.columns - 1, maxWalkways)
                : undefined;

              return (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    จำนวนทางเดิน
                    <span className="text-xs text-gray-400 ml-1">(สูงสุด {maxWalkways})</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={maxWalkways}
                    step="1"
                    placeholder="อัตโนมัติ"
                    value={walkwaysVal ?? ""}
                    onChange={e => {
                      const v = parseInt(e.target.value);
                      setConfig(prev => ({
                        ...prev,
                        columns: isNaN(v) || e.target.value === ""
                          ? undefined
                          : Math.min(Math.max(v + 1, 2), maxCols),
                        rows: undefined,
                      }));
                    }}
                    className={inputClass}
                  />
                  <p className="text-xs text-gray-400">
                    {walkwaysVal !== undefined
                      ? `${walkwaysVal} ทางเดิน → ${walkwaysVal + 1} คอลัมน์`
                      : `อัตโนมัติ: ลองทุกรูปแบบ 1–${maxWalkways} ทางเดิน`}
                  </p>
                </div>
              );
            })()}

            {/* Blackboard depth — แยก min ตาม mode */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                พื้นที่หน้าห้องสำหรับเดิน (เมตร)
                {config.layoutMode === "classroom"
                  ? <span className="text-xs text-gray-400 ml-1">ต่ำสุด {DEFAULT_SPACING.MIN_BLACKBOARD_DEPTH}m</span>
                  : <span className="text-xs text-gray-400 ml-1">ต่ำสุด 0</span>
                }
              </label>
              <input type="number"
                min={minBd}
                step="0.1"
                value={config.blackboardDepth}
                onChange={e => handleChange("blackboardDepth", e.target.value)}
                className={inputClass} />
              <p className="text-xs text-gray-400">หักออกจากความยาวห้องก่อนวางโต๊ะ</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <button type="button" onClick={onClose}
            className="flex-1 border py-2 rounded-lg hover:bg-gray-50">ยกเลิก</button>
          <button type="button" onClick={handleGenerate}
            className="flex-1 bg-[#006B67] text-white py-2 rounded-lg hover:bg-[#005a56]">
            สร้างแผนผังอัตโนมัติ
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutoGen;
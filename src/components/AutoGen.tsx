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
  const [capacityWarning, setCapacityWarning] = useState<string | null>(null);

  // ล้าง warning เมื่อเปิด modal
  useEffect(() => {
    if (isOpen) setCapacityWarning(null);
  }, [isOpen]);

  // เมื่อเปลี่ยน mode — อัปเดต blackboardDepth ให้ตรง default ของ mode นั้น
  const handleModeChange = (mode: "classroom" | "exam") => {
    setConfig(prev => ({
      ...prev,
      layoutMode: mode,
      blackboardDepth: mode === "exam"
        ? DEFAULT_SPACING.examBlackboardDepth
        : DEFAULT_SPACING.blackboardDepth,
    }));
    setCapacityWarning(null);
  };

  if (!isOpen) return null;

  const set = (key: keyof LayoutConfig, value: number | string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setCapacityWarning(null);
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
    const { roomWidth, roomHeight, deskWidth, deskHeight, totalDesks, layoutMode } = config;
    if (!roomWidth || !roomHeight || !deskWidth || !deskHeight || !totalDesks) {
      alert("กรุณากรอกข้อมูลให้ครบ"); return;
    }
    if (totalDesks <= 0) { alert("จำนวนโต๊ะต้องมากกว่า 0"); return; }

    const maxCap = layoutMode === "exam"
      ? calcMaxCapacityExam(config)
      : calcMaxCapacity(config);

    if (totalDesks > maxCap) {
      setCapacityWarning(
        `ห้องนี้จุโต๊ะได้สูงสุด ${maxCap} ตัว (${layoutMode === "exam" ? "ห้องสอบ" : "ห้องเรียน"}) — คุณกรอก ${totalDesks}`
      );
      return;
    }
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
          <h2 className="font-bold text-lg text-gray-800">Generate Layouts</h2>
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

        {/* Required fields — step="0.1" ทุกช่องยกเว้นโต๊ะ */}
        {[
          { key: "roomWidth",  label: "ความกว้างห้อง (เมตร)",  step: "0.1" },
          { key: "roomHeight", label: "ความยาวห้อง (เมตร)",    step: "0.1" },
          { key: "deskWidth",  label: "ความกว้างโต๊ะ (เมตร)",  step: "0.1" },
          { key: "deskHeight", label: "ความยาวโต๊ะ (เมตร)",    step: "0.1" },
        ].map(({ key, label, step }) => (
          <div key={key} className="space-y-1">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <input type="number" min="0.1" step={step}
              value={config[key as keyof LayoutConfig] as number ?? ""}
              onChange={e => handleChange(key as keyof LayoutConfig, e.target.value)}
              className={inputClass} />
          </div>
        ))}

        {/* จำนวนโต๊ะ — step="1" เพราะเป็นจำนวนเต็ม */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">จำนวนโต๊ะที่ต้องการวาง</label>
          <input type="number" min="1" step="1"
            value={config.totalDesks ?? ""}
            onChange={e => {
              const v = parseInt(e.target.value);
              if (!isNaN(v) && v > 0) set("totalDesks", v);
            }}
            className={inputClass} />
          {maxCap !== null && (
            <p className="text-xs text-blue-500">ความจุสูงสุด: <span className="font-bold">{maxCap} ตัว</span></p>
          )}
        </div>

        {/* Capacity warning */}
        {capacityWarning && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
            ⚠️ {capacityWarning}
          </div>
        )}

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
                  <span className="text-xs text-gray-400 ml-1">ขั้นต่ำ {DEFAULT_SPACING.MIN_SPACING_X}</span>
                </label>
                <input type="number" min={DEFAULT_SPACING.MIN_SPACING_X} step="0.1"
                  value={config.spacingX}
                  onChange={e => handleChange("spacingX", e.target.value)}
                  className={inputClass} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  ระยะห่างระหว่างแถว (เมตร)
                  <span className="text-xs text-gray-400 ml-1">ขั้นต่ำ {DEFAULT_SPACING.MIN_SPACING_Y}</span>
                </label>
                <input type="number" min={DEFAULT_SPACING.MIN_SPACING_Y} step="0.1"
                  value={config.spacingY}
                  onChange={e => handleChange("spacingY", e.target.value)}
                  className={inputClass} />
              </div>
            </div>

            {config.layoutMode === "classroom" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    คอลัมน์ (สูงสุด {MAX_COLUMNS})
                  </label>
                  <input type="number" min="1" max={MAX_COLUMNS} step="1"
                    placeholder="อัตโนมัติ"
                    value={config.columns ?? ""}
                    onChange={e => {
                      const v = parseInt(e.target.value);
                      setConfig(prev => ({
                        ...prev,
                        columns: isNaN(v) || e.target.value === "" ? undefined : Math.min(Math.max(v, 1), MAX_COLUMNS),
                      }));
                    }}
                    className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">แถว</label>
                  <input type="number" min="1" step="1"
                    placeholder="อัตโนมัติ"
                    value={config.rows ?? ""}
                    onChange={e => {
                      const v = parseInt(e.target.value);
                      setConfig(prev => ({
                        ...prev,
                        rows: isNaN(v) || e.target.value === "" ? undefined : Math.max(v, 1),
                      }));
                    }}
                    className={inputClass} />
                </div>
              </div>
            )}

            {/* Blackboard depth — แยก min ตาม mode */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                พื้นที่หน้ากระดาน (เมตร)
                {config.layoutMode === "classroom"
                  ? <span className="text-xs text-gray-400 ml-1">ขั้นต่ำ {DEFAULT_SPACING.MIN_BLACKBOARD_DEPTH}m</span>
                  : <span className="text-xs text-gray-400 ml-1">ห้องสอบ — ไม่บังคับขั้นต่ำ</span>
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
            Generate Layouts
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutoGen;
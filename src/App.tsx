// App.tsx
import { useState, useCallback, useRef, useEffect } from "react";
import { Stage, Layer, Rect, Text, Group, Line } from "react-konva";
import Konva from "konva";
import axios from "axios";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import { Auth } from "./hooks/Auth";
import AutoGen from "./components/AutoGen";

import RegisterPage from "./pages/RegisterPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import LoginPage from "./pages/LoginPage";
import ManageUsers from "./pages/ManageUsers";
import ManageRooms from "./pages/ManageRooms";

import LayoutPreviewGrid from "./components/LayoutPreviewGrid";
import { useDialog } from "./hooks/useDialog";

import {
  generateLayouts,
  buildDesksFromLayout,
  LayoutResult,
} from "./layout/algorithms/layoutGenerator";
import {
  LayoutConfig,
  DEFAULT_SPACING,
  SCALE,
} from "./types";

const ROOM_PADDING = 120;

interface DeskAsset {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

function AppContent() {
  const location = useLocation();
  const { user, loading, handleLogout } = Auth();

  const [building, setBuilding] = useState("");
  const [floor, setFloor]       = useState("");
  const [room, setRoom]         = useState("");

  const [generatedLayouts, setGeneratedLayouts] = useState<LayoutResult[]>([]);
  const [selectedIndex, setSelectedIndex]       = useState(0);
  const [currentDesks, setCurrentDesks]         = useState<DeskAsset[]>([]);
  const [roomRect, setRoomRect]                 = useState({ width: 0, height: 0 });
  const [lastConfig, setLastConfig]             = useState<LayoutConfig | null>(null);
  const [hasSavedLayout, setHasSavedLayout]     = useState(false);
  const [savedMeta, setSavedMeta]               = useState<{
    savedBy?: string; updatedAt?: string; desks?: number;
  } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving]           = useState(false);
  const { toast: dlgToast, confirm } = useDialog();

  // ── Infinite canvas ──────────────────────────────────────────
  const stageRef      = useRef<Konva.Stage>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 1600, height: 600 });
  const [camScale, setCamScale]   = useState(1);
  const [camPos,   setCamPos]     = useState({ x: 0, y: 0 });

  // ResizeObserver วัดขนาด canvas wrapper จริงๆ
  useEffect(() => {
    const el = canvasWrapRef.current;
    if (!el) return;

    const update = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w > 0 && h > 0) setStageSize({ width: w, height: h });
    };

    const ro = new ResizeObserver(update);
    ro.observe(el);
    update(); // อ่านค่าทันที
    return () => ro.disconnect();
  }, []);

  const fitRoom = useCallback((roomW: number, roomH: number) => {
    const el = canvasWrapRef.current;
    const vw = el ? el.clientWidth  : stageSize.width;
    const vh = el ? el.clientHeight : stageSize.height;
    if (!vw || !vh || !roomW || !roomH) return;
    const s = Math.min(
      (vw - ROOM_PADDING * 2) / roomW,
      (vh - ROOM_PADDING * 2) / roomH,
      1.5
    );
    setCamScale(s);
    setCamPos({ x: (vw - roomW * s) / 2, y: (vh - roomH * s) / 2 });
  }, [stageSize]);

  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const SPEED    = 1.08;
    const pointer  = stage.getPointerPosition()!;
    const dir      = e.evt.deltaY < 0 ? 1 : -1;
    const newScale = Math.min(Math.max(camScale * (dir > 0 ? SPEED : 1 / SPEED), 0.05), 8);
    const pt = {
      x: (pointer.x - camPos.x) / camScale,
      y: (pointer.y - camPos.y) / camScale,
    };
    setCamScale(newScale);
    setCamPos({ x: pointer.x - pt.x * newScale, y: pointer.y - pt.y * newScale });
  }, [camScale, camPos]);

  const handleDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    if (e.target === stageRef.current) {
      setCamPos({ x: e.target.x(), y: e.target.y() });
    }
  }, []);

  const notify = (ok: boolean, msg: string) => dlgToast(msg, ok ? "success" : "error");

  const loadLayout = useCallback(async (b: string, f: string, r: string) => {
    setGeneratedLayouts([]);
    setCurrentDesks([]);
    setRoomRect({ width: 0, height: 0 });
    setHasSavedLayout(false);
    setSavedMeta(null);
    if (!b || !f || !r) return;
    try {
      const res  = await axios.get(`http://localhost:5000/api/layout/${b}/${f}/${r}`);
      const data = res.data;
      if (data?.desks) {
        setCurrentDesks(data.desks);
        setRoomRect({ width: data.roomPixelWidth, height: data.roomPixelHeight });
        setLastConfig(data.config);
        setHasSavedLayout(true);
        setSavedMeta({ savedBy: data.savedBy, updatedAt: data.updatedAt, desks: data.desks.length });
        setShowPreview(false);
        setTimeout(() => fitRoom(data.roomPixelWidth, data.roomPixelHeight), 80);
      }
    } catch (err: any) {
      if (err.response?.status !== 404) console.error(err);
    }
  }, [fitRoom]);

  if (loading) return <div className="p-4">Loading...</div>;

  if (!user) {
    return (
      <Routes>
        <Route path="/"                      element={<LoginPage />} />
        <Route path="/register"              element={<RegisterPage />} />
        <Route path="/forgot-password"       element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    );
  }

  const isManagePage =
    location.pathname === "/manage-users" ||
    location.pathname === "/manage-rooms";

  const handleGenerate = (config: LayoutConfig) => {
    const roomW = config.roomWidth  * SCALE;
    const roomH = config.roomHeight * SCALE;
    const bdH   = (config.blackboardDepth ?? DEFAULT_SPACING.blackboardDepth) * SCALE;
    setRoomRect({ width: roomW, height: roomH });
    const results = generateLayouts(config);
    if (results.length === 0) { notify(false, "ไม่สามารถสร้าง Layout ได้ในขนาดห้องนี้"); return; }
    setGeneratedLayouts(results);
    setSelectedIndex(0);
    setLastConfig(config);
    setIsModalOpen(false);
    setShowPreview(true);
    setCurrentDesks(buildDesksFromLayout(results[0], ROOM_PADDING, ROOM_PADDING + bdH, roomW, SCALE));
    setTimeout(() => fitRoom(roomW, roomH), 80);
  };

  const handleSelectLayout = (idx: number) => {
    setSelectedIndex(idx);
    if (!lastConfig) return;
    const bdH = (lastConfig.blackboardDepth ?? DEFAULT_SPACING.blackboardDepth) * SCALE;
    setCurrentDesks(buildDesksFromLayout(
      generatedLayouts[idx], ROOM_PADDING, ROOM_PADDING + bdH, roomRect.width, SCALE
    ));
    setShowPreview(false);
  };

  const saveLayout = async () => {
    if (!building || !floor || !room) { notify(false, "กรุณาเลือก ตึก / ชั้น / ห้อง"); return; }
    if (currentDesks.length === 0)    { notify(false, "ยังไม่มี Layout"); return; }
    setSaving(true);
    try {
      await axios.post("http://localhost:5000/api/layout/save", {
        building, floor, room, desks: currentDesks,
        roomPixelWidth: roomRect.width, roomPixelHeight: roomRect.height,
        config: lastConfig, savedBy: user.name,
      });
      setHasSavedLayout(true);
      setSavedMeta({ savedBy: user.name, updatedAt: new Date().toISOString(), desks: currentDesks.length });
      notify(true, "บันทึก Layout สำเร็จ ✓");
      setShowPreview(false);
    } catch { notify(false, "บันทึกไม่สำเร็จ"); }
    finally { setSaving(false); }
  };

  const deleteLayout = async () => {
    if (!await confirm("ลบ Layout นี้ออกจากระบบ?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/layout/${building}/${floor}/${room}`);
      setCurrentDesks([]); setRoomRect({ width: 0, height: 0 });
      setHasSavedLayout(false); setGeneratedLayouts([]);
      notify(true, "ลบ Layout แล้ว");
    } catch { notify(false, "ลบไม่สำเร็จ"); }
  };

  const zoomIn    = () => setCamScale(s => Math.min(s * 1.2, 8));
  const zoomOut   = () => setCamScale(s => Math.max(s / 1.2, 0.05));
  const resetView = () => { if (roomRect.width > 0) fitRoom(roomRect.width, roomRect.height); };

  const renderGrid = () => {
    const step = 60;
    const wl = (-camPos.x / camScale) - 200;
    const wt = (-camPos.y / camScale) - 200;
    const wr = wl + stageSize.width  / camScale + 400;
    const wb = wt + stageSize.height / camScale + 400;
    const sx = Math.floor(wl / step) * step;
    const sy = Math.floor(wt / step) * step;
    const sw = 1 / camScale;
    const els: React.ReactNode[] = [];
    for (let x = sx; x < wr; x += step)
      els.push(<Line key={`v${x}`} points={[x, wt, x, wb]} stroke="#e5e7eb" strokeWidth={sw} />);
    for (let y = sy; y < wb; y += step)
      els.push(<Line key={`h${y}`} points={[wl, y, wr, y]} stroke="#e5e7eb" strokeWidth={sw} />);
    return els;
  };

  const bdH   = (lastConfig?.blackboardDepth ?? DEFAULT_SPACING.blackboardDepth) * SCALE;
  const doorW = 0.9  * SCALE;
  const doorH = 0.15 * SCALE;

  /*
   * ROOT: width:100% + height:100% ทำงานได้เพราะ index.css กำหนด
   * html, body, #root { height: 100% } ไว้แล้ว
   * ไม่ต้องใช้ position:fixed อีกต่อไป
   */
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#f3f4f6", overflow: "hidden" }}>

      {/* Navbar */}
      <div style={{ flexShrink: 0 }}>
        <Navbar
          name={user.name} role={user.role}
          onLogout={handleLogout}
          onRoomChange={(b, f, r) => { setBuilding(b); setFloor(f); setRoom(r); loadLayout(b, f, r); }}
          hasLayout={hasSavedLayout}
          onEditLayout={() => setIsModalOpen(true)}
        />
      </div>

      {/* Manage pages */}
      <Routes>
        <Route path="/manage-users" element={<ManageUsers />} />
        <Route path="/manage-rooms" element={<ManageRooms />} />
      </Routes>

      {!isManagePage && (
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>

          {/* Toolbar */}
          {currentDesks.length > 0 && (
            <div style={{ flexShrink: 0 }}
              className="flex items-center gap-3 px-6 py-2.5 bg-white border-b border-gray-100 shadow-sm">
              <div className="flex items-center gap-2">
                <i className="bi bi-door-open text-[#006B67]" />
                <span className="text-sm font-semibold text-gray-800">ห้อง {room}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span className="text-sm font-semibold text-[#006B67]">{currentDesks.length} โต๊ะ</span>
              </div>
              <div style={{ flex: 1 }} />
              {generatedLayouts.length > 0 && (
                <button onClick={() => setShowPreview(v => !v)}
                  className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition
                    ${showPreview
                      ? "bg-[#006B67] text-white border-[#006B67]"
                      : "text-gray-600 border-gray-200 hover:border-[#006B67]"}`}>
                  <i className="bi bi-grid" />
                  {showPreview ? "ซ่อน Preview" : `เลือกรูปแบบ (${generatedLayouts.length})`}
                </button>
              )}
              <button onClick={saveLayout} disabled={saving}
                className="flex items-center gap-1.5 bg-[#006B67] text-white text-sm px-4 py-1.5 rounded-lg hover:bg-[#005a56] transition shadow disabled:opacity-60">
                <i className="bi bi-save" />
                {saving ? "กำลังบันทึก..." : "บันทึก Layout"}
              </button>
              {hasSavedLayout && (
                <button onClick={deleteLayout} title="ลบ Layout"
                  className="text-red-400 hover:text-red-600 px-2 py-1.5 rounded-lg hover:bg-red-50 transition text-sm">
                  <i className="bi bi-trash" />
                </button>
              )}
            </div>
          )}

          {/* Preview grid */}
          {showPreview && generatedLayouts.length > 0 && (
            <div style={{ flexShrink: 0 }} className="bg-white border-b border-gray-100 px-6 py-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                เลือกรูปแบบที่ต้องการ ({generatedLayouts.length} รูปแบบ)
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-2">
                {generatedLayouts.map((layout, i) => (
                  <LayoutPreviewGrid key={layout.id} layout={layout}
                    selected={selectedIndex === i}
                    onSelect={() => handleSelectLayout(i)} />
                ))}
              </div>
            </div>
          )}

          {/* ── CANVAS WRAPPER ── flex:1 minHeight:0 = กิน space ที่เหลือทั้งหมด */}
          <div
            ref={canvasWrapRef}
            style={{ flex: 1, minHeight: 0, position: "relative", overflow: "hidden", background: "#f9fafb" }}
          >
            {/* Empty state overlay */}
            {currentDesks.length === 0 && (
              <div style={{
                position: "absolute", inset: 0, zIndex: 5,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
              }}>
                <i className="bi bi-layout-wtf" style={{ fontSize: 48, color: "#d1d5db", marginBottom: 12 }} />
                <p style={{ color: "#6b7280", fontWeight: 500 }}>
                  {room ? "ห้องนี้ยังไม่มี Layout" : "เลือกห้องจาก Navbar เพื่อดู Layout"}
                </p>
                {room && (
                  <button onClick={() => setIsModalOpen(true)}
                    className="mt-4 bg-[#006B67] text-white px-5 py-2.5 rounded-xl hover:bg-[#005a56] transition shadow-md">
                    <i className="bi bi-magic me-2" />สร้าง Layout
                  </button>
                )}
              </div>
            )}

            {/* Konva Stage — always mounted */}
            <Stage
              ref={stageRef}
              width={stageSize.width}
              height={stageSize.height}
              scaleX={camScale}
              scaleY={camScale}
              x={camPos.x}
              y={camPos.y}
              draggable={currentDesks.length > 0}
              onDragEnd={handleDragEnd}
              onWheel={currentDesks.length > 0 ? handleWheel : undefined}
            >
              <Layer>
                {currentDesks.length > 0 && renderGrid()}

                {roomRect.width > 0 && currentDesks.length > 0 && (
                  <>
                    <Rect x={ROOM_PADDING} y={ROOM_PADDING}
                      width={roomRect.width} height={roomRect.height}
                      fill="#f0faf9" stroke="#006B67" strokeWidth={3} cornerRadius={2} />
                    <Rect x={ROOM_PADDING} y={ROOM_PADDING}
                      width={roomRect.width} height={bdH}
                      fill="#006B67" opacity={0.12} />
                    <Rect
                      x={ROOM_PADDING + roomRect.width * 0.2} y={ROOM_PADDING+1}
                      width={roomRect.width * 0.6} height={doorH}
                      fill="#006B67" cornerRadius={2} opacity={0.85} />
                    <Text text=""
                      x={ROOM_PADDING + roomRect.width / 2 - 22} y={ROOM_PADDING + 10}
                      fill="white" fontSize={11} fontStyle="bold" />
                    <Rect x={ROOM_PADDING} y={ROOM_PADDING + bdH * 0.4}
                      width={doorH} height={doorW}
                      fill="#006B67" cornerRadius={2} opacity={0.85} />
                    <Text text=""
                      x={ROOM_PADDING - 28} y={ROOM_PADDING + bdH * 0.4 + doorW / 2 - 6}
                      fill="#006B67" fontSize={10} />
                  </>
                )}

                {currentDesks.map(desk => (
                  <Group key={desk.id} x={desk.x} y={desk.y}>
                    <Rect width={desk.width} height={desk.height}
                      fill="#3b82f6" cornerRadius={3}
                      shadowColor="rgba(0,0,0,0.1)" shadowBlur={3} shadowOffsetY={1} />
                    <Text text={desk.name} fill="white"
                      width={desk.width} height={desk.height}
                      align="center" verticalAlign="middle"
                      fontSize={Math.min(desk.width, desk.height) * 0.35} />
                  </Group>
                ))}
              </Layer>
            </Stage>

            {/* Floating config panel */}
            {lastConfig && currentDesks.length > 0 && hasSavedLayout && (
              <div style={{ position: "absolute", top: 12, left: 12, zIndex: 10, width: 176, pointerEvents: "none" }}>
                <div className="bg-white/90 backdrop-blur rounded-xl border border-gray-100 shadow-lg p-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">การตั้งค่าปัจจุบัน</p>
                  {[
                    { icon: "bi-aspect-ratio",         label: "ขนาดห้อง",   value: `${lastConfig.roomWidth} × ${lastConfig.roomHeight} ม.` },
                    { icon: "bi-table",                 label: "ขนาดโต๊ะ",   value: `${lastConfig.deskWidth} × ${lastConfig.deskHeight} ม.` },
                    { icon: "bi-distribute-horizontal", label: "ทางเดิน",    value: `${lastConfig.spacingX} ม.` },
                    { icon: "bi-distribute-vertical",   label: "ระยะแถว",    value: `${lastConfig.spacingY} ม.` },
                    { icon: "bi-easel",                 label: "หน้ากระดาน", value: `${lastConfig.blackboardDepth} ม.` },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="flex items-start gap-1.5">
                      <i className={`bi ${icon} text-[#006B67] text-xs mt-0.5 shrink-0`} />
                      <div>
                        <p className="text-xs text-gray-400 leading-none">{label}</p>
                        <p className="text-xs font-medium text-gray-700 mt-0.5">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Zoom controls */}
            {currentDesks.length > 0 && (
              <div style={{ position: "absolute", bottom: 16, right: 16, zIndex: 10, display: "flex", flexDirection: "column", gap: 4 }}>
                <button onClick={zoomIn}
                  className="w-8 h-8 bg-white border border-gray-200 rounded-lg shadow text-gray-700 hover:bg-gray-50 transition flex items-center justify-center font-bold">+</button>
                <button onClick={resetView} title="Fit to screen"
                  className="w-8 h-8 bg-white border border-gray-200 rounded-lg shadow text-gray-500 hover:bg-gray-50 transition flex items-center justify-center">
                  <i className="bi bi-fullscreen text-xs" /></button>
                <button onClick={zoomOut}
                  className="w-8 h-8 bg-white border border-gray-200 rounded-lg shadow text-gray-700 hover:bg-gray-50 transition flex items-center justify-center font-bold">−</button>
                <div className="bg-white/90 border border-gray-200 rounded-lg px-1 py-0.5 text-center text-xs text-gray-500 shadow">
                  {Math.round(camScale * 100)}%
                </div>
              </div>
            )}

            {/* Pan hint */}
            {currentDesks.length > 0 && (
              <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", zIndex: 10, pointerEvents: "none" }}
                className="text-xs text-gray-400 bg-white/70 backdrop-blur px-3 py-1 rounded-full border border-gray-200 select-none whitespace-nowrap">
                เลื่อน: ลาก | ซูม: Scroll
              </div>
            )}
          </div>
          {/* END CANVAS WRAPPER */}

          {/* Footer */}
          {savedMeta && !showPreview && (
            <div style={{ flexShrink: 0 }}
              className="bg-white/80 backdrop-blur border-t border-gray-100 px-6 py-2 flex items-center gap-3 text-xs text-gray-400">
              <i className="bi bi-check-circle text-emerald-500" />
              <span>บันทึกโดย <span className="font-medium text-gray-600">{savedMeta.savedBy}</span></span>
              <span>·</span>
              <span>{savedMeta.updatedAt && new Date(savedMeta.updatedAt).toLocaleString("th-TH")}</span>
              <span>·</span>
              <span>{savedMeta.desks} โต๊ะ</span>
            </div>
          )}
        </div>
      )}

      <AutoGen isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onGenerate={handleGenerate} />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
// App.tsx
import { useState, useCallback, useRef, useEffect } from "react";
import { Stage, Layer, Rect, Text, Group } from "react-konva";
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

import {
  generateLayouts,
  buildDesksFromLayout,
  LayoutResult,
} from "./layout/algorithms/layoutGenerator";
import {
  LayoutConfig,
  DEFAULT_SPACING,
  SCALE,
  STAGE_WIDTH,
  STAGE_HEIGHT,
} from "./types";

interface DeskAsset {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

// แยก component ที่ใช้ useLocation ออกมา เพราะต้องอยู่ใต้ BrowserRouter
function AppContent() {
  const location = useLocation();
  const { user, loading, handleLogout } = Auth();

  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [room, setRoom] = useState("");

  const [generatedLayouts, setGeneratedLayouts] = useState<LayoutResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentDesks, setCurrentDesks] = useState<DeskAsset[]>([]);
  const [roomRect, setRoomRect] = useState({ width: 0, height: 0 });
  const [lastConfig, setLastConfig] = useState<LayoutConfig | null>(null);
  const [hasSavedLayout, setHasSavedLayout] = useState(false);
  const [savedMeta, setSavedMeta] = useState<{ savedBy?: string; updatedAt?: string; desks?: number } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);

  // วัดความกว้างจริงของ container เพื่อ scale canvas ให้พอดี
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvasScale, setCanvasScale] = useState(1);

  useEffect(() => {
    const el = canvasContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(entries => {
      const containerW = entries[0].contentRect.width;
      if (containerW > 0 && containerW < STAGE_WIDTH) {
        setCanvasScale(containerW / STAGE_WIDTH);
      } else {
        setCanvasScale(1);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const notify = (ok: boolean, msg: string) => {
    setToast({ ok, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const loadLayout = useCallback(async (b: string, f: string, r: string) => {
    setGeneratedLayouts([]);
    setCurrentDesks([]);
    setRoomRect({ width: 0, height: 0 });
    setHasSavedLayout(false);
    setSavedMeta(null);
    if (!b || !f || !r) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/layout/${b}/${f}/${r}`);
      const data = res.data;
      if (data?.desks) {
        setCurrentDesks(data.desks);
        setRoomRect({ width: data.roomPixelWidth, height: data.roomPixelHeight });
        setLastConfig(data.config);
        setHasSavedLayout(true);
        setSavedMeta({ savedBy: data.savedBy, updatedAt: data.updatedAt, desks: data.desks.length });
        setShowPreview(false);
      }
    } catch (err: any) {
      if (err.response?.status !== 404) console.error(err);
    }
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;

  // หน้า auth — ไม่ต้อง login
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    );
  }

  // หน้าจัดการ — มี Navbar แต่ไม่มี canvas
  const isManagePage = location.pathname === "/manage-users" || location.pathname === "/manage-rooms";

  const handleGenerate = (config: LayoutConfig) => {
    const roomW = config.roomWidth * SCALE;
    const roomH = config.roomHeight * SCALE;
    const bdH = (config.blackboardDepth ?? DEFAULT_SPACING.blackboardDepth) * SCALE;
    setRoomRect({ width: roomW, height: roomH });

    const results = generateLayouts(config);
    if (results.length === 0) { notify(false, "ไม่สามารถสร้าง Layout ได้ในขนาดห้องนี้"); return; }

    setGeneratedLayouts(results);
    setSelectedIndex(0);
    setLastConfig(config);
    setIsModalOpen(false);
    setShowPreview(true);

    const sX = (STAGE_WIDTH - roomW) / 2;
    const sY = (STAGE_HEIGHT - roomH) / 2;
    setCurrentDesks(buildDesksFromLayout(results[0], sX, sY + bdH, roomW, SCALE));
  };

  const handleSelectLayout = (idx: number) => {
    setSelectedIndex(idx);
    if (!lastConfig) return;
    const roomW = roomRect.width;
    const bdH = (lastConfig.blackboardDepth ?? DEFAULT_SPACING.blackboardDepth) * SCALE;
    const sX = (STAGE_WIDTH - roomW) / 2;
    const sY = (STAGE_HEIGHT - roomRect.height) / 2;
    setCurrentDesks(buildDesksFromLayout(generatedLayouts[idx], sX, sY + bdH, roomW, SCALE));
    setShowPreview(false);
  };

  const saveLayout = async () => {
    if (!building || !floor || !room) { notify(false, "กรุณาเลือก ตึก / ชั้น / ห้อง"); return; }
    if (currentDesks.length === 0) { notify(false, "ยังไม่มี Layout"); return; }
    setSaving(true);
    try {
      await axios.post("http://localhost:5000/api/layout/save", {
        building, floor, room,
        desks: currentDesks,
        roomPixelWidth: roomRect.width,
        roomPixelHeight: roomRect.height,
        config: lastConfig,
        savedBy: user.name,
      });
      setHasSavedLayout(true);
      // อัปเดต savedMeta ทันที ไม่ต้องรีเฟรช
      setSavedMeta({
        savedBy: user.name,
        updatedAt: new Date().toISOString(),
        desks: currentDesks.length,
      });
      notify(true, "บันทึก Layout สำเร็จ ✓");
      setShowPreview(false);
    } catch { notify(false, "บันทึกไม่สำเร็จ"); }
    finally { setSaving(false); }
  };

  const deleteLayout = async () => {
    if (!confirm("ลบ Layout นี้ออกจากระบบ?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/layout/${building}/${floor}/${room}`);
      setCurrentDesks([]); setRoomRect({ width: 0, height: 0 });
      setHasSavedLayout(false); setGeneratedLayouts([]);
      notify(true, "ลบ Layout แล้ว");
    } catch { notify(false, "ลบไม่สำเร็จ"); }
  };

  const stageStartX = (STAGE_WIDTH - roomRect.width) / 2;
  const stageStartY = (STAGE_HEIGHT - roomRect.height) / 2;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium
          ${toast.ok ? "bg-emerald-500" : "bg-red-500"}`}>
          {toast.msg}
        </div>
      )}

      {/* Navbar — แสดงทุกหน้าที่ login แล้ว */}
      <Navbar
        name={user.name}
        role={user.role}
        onLogout={handleLogout}
        onRoomChange={(b, f, r) => {
          setBuilding(b); setFloor(f); setRoom(r);
          loadLayout(b, f, r);
        }}
        hasLayout={hasSavedLayout}
        onEditLayout={() => setIsModalOpen(true)}
      />

      {/* หน้าจัดการ — render แทน canvas */}
      <Routes>
        <Route path="/manage-users" element={<ManageUsers />} />
        <Route path="/manage-rooms" element={<ManageRooms />} />
      </Routes>

      {/* Canvas section — ซ่อนเมื่ออยู่หน้าจัดการ */}
      {!isManagePage && (
        <>
          {/* Toolbar */}
          {currentDesks.length > 0 && (
            <div className="flex items-center gap-3 px-6 py-2.5 bg-white border-b border-gray-100 shadow-sm">
              <div className="flex items-center gap-2">
                <i className="bi bi-door-open text-[#006B67]"></i>
                <span className="text-sm font-semibold text-gray-800">ห้อง {room}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <span className="text-sm font-semibold text-[#006B67]">{currentDesks.length} โต๊ะ</span>
              </div>
              <div className="flex-1" />
              {generatedLayouts.length > 0 && (
                <button onClick={() => setShowPreview(!showPreview)}
                  className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition
                    ${showPreview ? "bg-[#006B67] text-white border-[#006B67]" : "text-gray-600 border-gray-200 hover:border-[#006B67]"}`}>
                  <i className="bi bi-grid"></i>
                  {showPreview ? "ซ่อน Preview" : `เลือกรูปแบบ (${generatedLayouts.length})`}
                </button>
              )}
              <button onClick={saveLayout} disabled={saving}
                className="flex items-center gap-1.5 bg-[#006B67] text-white text-sm px-4 py-1.5 rounded-lg
                           hover:bg-[#005a56] transition shadow disabled:opacity-60">
                <i className="bi bi-save"></i>
                {saving ? "กำลังบันทึก..." : "บันทึก Layout"}
              </button>
              {hasSavedLayout && (
                <button onClick={deleteLayout}
                  className="text-red-400 hover:text-red-600 px-2 py-1.5 rounded-lg hover:bg-red-50 transition text-sm"
                  title="ลบ Layout">
                  <i className="bi bi-trash"></i>
                </button>
              )}
            </div>
          )}

          {/* Preview grid */}
          {showPreview && generatedLayouts.length > 0 && (
            <div className="bg-white border-b border-gray-100 px-6 py-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                เลือกรูปแบบที่ต้องการ ({generatedLayouts.length} รูปแบบ)
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-2">
                {generatedLayouts.map((layout, i) => (
                  <LayoutPreviewGrid
                    key={layout.id}
                    layout={layout}
                    selected={selectedIndex === i}
                    onSelect={() => handleSelectLayout(i)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Canvas + Config Sidebar */}
          <div className="flex items-start pt-2">
            {/* Config sidebar ซ้าย — แสดงเฉพาะเมื่อมี layout บันทึกแล้ว */}
            {lastConfig && currentDesks.length > 0 && hasSavedLayout && (
              <div className="w-48 shrink-0 mx-4 mt-2">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    การตั้งค่าปัจจุบัน
                  </p>
                  {[
                    { icon: "bi-aspect-ratio",        label: "ขนาดห้อง",    value: `${lastConfig.roomWidth} × ${lastConfig.roomHeight} เมตร` },
                    { icon: "bi-table",               label: "ขนาดโต๊ะ",    value: `${lastConfig.deskWidth} × ${lastConfig.deskHeight} เมตร` },
                    { icon: "bi-distribute-horizontal", label: "ทางเดิน",   value: `${lastConfig.spacingX} เมตร` },
                    { icon: "bi-distribute-vertical", label: "ระยะแถว",     value: `${lastConfig.spacingY} เมตร` },
                    { icon: "bi-easel",               label: "หน้ากระดาน",  value: `${lastConfig.blackboardDepth} เมตร` },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="flex items-start gap-2">
                      <i className={`bi ${icon} text-[#006B67] text-sm mt-0.5 shrink-0`}></i>
                      <div>
                        <p className="text-xs text-gray-400 leading-none">{label}</p>
                        <p className="text-sm font-medium text-gray-700 mt-0.5">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Canvas — scale ให้พอดีกับความกว้างจริง ไม่ scroll */}
            <div className="flex-1 min-w-0" ref={canvasContainerRef}>
              <div
                style={{
                  width: STAGE_WIDTH * canvasScale,
                  height: STAGE_HEIGHT * canvasScale,
                  transform: `scale(${canvasScale})`,
                  transformOrigin: "top left",
                }}
              >
                <Stage width={STAGE_WIDTH} height={STAGE_HEIGHT}>
                  <Layer>
                    {roomRect.width > 0 && (() => {
                      const bdH = (lastConfig?.blackboardDepth ?? DEFAULT_SPACING.blackboardDepth) * SCALE;
                      const doorW = 0.9 * SCALE;
                      const doorH = 0.15 * SCALE;
                      return (
                        <>
                          <Rect x={stageStartX} y={stageStartY}
                            width={roomRect.width} height={roomRect.height}
                            fill="#f0faf9" stroke="#006B67" strokeWidth={3} cornerRadius={2} />
                          <Rect x={stageStartX} y={stageStartY}
                            width={roomRect.width} height={bdH}
                            fill="#006B67" opacity={0.12} />
                          <Rect x={stageStartX + roomRect.width * 0.2} y={stageStartY + 6}
                            width={roomRect.width * 0.6} height={bdH * 0.25}
                            fill="#006B67" cornerRadius={2} opacity={0.7} />
                          <Text text="กระดาน"
                            x={stageStartX + roomRect.width / 2 - 22} y={stageStartY + 10}
                            fill="white" fontSize={11} fontStyle="bold" />
                          <Rect x={stageStartX} y={stageStartY + bdH * 0.4}
                            width={doorH} height={doorW}
                            fill="#8B6914" cornerRadius={1} opacity={0.85} />
                          <Text text="ประตู"
                            x={stageStartX - 28} y={stageStartY + bdH * 0.4 + doorW / 2 - 6}
                            fill="#006B67" fontSize={10} />
                        </>
                      );
                    })()}
                    {currentDesks.map((desk) => (
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
              </div>
            </div>
          </div>

          {/* Empty state */}
          {currentDesks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <i className="bi bi-layout-wtf text-5xl text-gray-300 mb-4"></i>
              <p className="text-gray-500 font-medium">
                {room ? "ห้องนี้ยังไม่มี Layout" : "เลือกห้องจาก Navbar เพื่อดู Layout"}
              </p>
              {room && (
                <button onClick={() => setIsModalOpen(true)}
                  className="mt-4 bg-[#006B67] text-white px-5 py-2.5 rounded-xl hover:bg-[#005a56] transition shadow-md">
                  <i className="bi bi-magic me-2"></i>สร้าง Layout
                </button>
              )}
            </div>
          )}

          {/* Footer metadata */}
          {savedMeta && !showPreview && (
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur border-t border-gray-100 px-6 py-2
                            flex items-center gap-3 text-xs text-gray-400">
              <i className="bi bi-check-circle text-emerald-500"></i>
              <span>บันทึกโดย <span className="font-medium text-gray-600">{user.name}</span></span>
              <span>·</span>
              <span>{savedMeta.updatedAt && new Date(savedMeta.updatedAt).toLocaleString("th-TH")}</span>
              <span>·</span>
              <span>{savedMeta.desks} โต๊ะ</span>
            </div>
          )}

          <AutoGen
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onGenerate={handleGenerate}
          />
        </>
      )}
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
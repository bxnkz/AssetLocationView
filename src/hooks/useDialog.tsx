import { createContext, useContext, useState, useCallback, ReactNode } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

type ToastType = "success" | "error" | "info";

interface ToastState {
  id: number;
  msg: string;
  type: ToastType;
}

interface ConfirmState {
  msg: string;
  resolve: (ok: boolean) => void;
}

interface DialogContextValue {
  toast:   (msg: string, type?: ToastType) => void;
  confirm: (msg: string) => Promise<boolean>;
}

// ── Context ──────────────────────────────────────────────────────────────────

const DialogContext = createContext<DialogContextValue | null>(null);

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog must be used inside <DialogProvider>");
  return ctx;
}

// ── Provider ─────────────────────────────────────────────────────────────────

export function DialogProvider({ children }: { children: ReactNode }) {
  const [toasts,  setToasts]  = useState<ToastState[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const toast = useCallback((msg: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  const confirm = useCallback((msg: string): Promise<boolean> => {
    return new Promise(resolve => {
      setConfirmState({ msg, resolve });
    });
  }, []);

  const handleConfirm = (ok: boolean) => {
    confirmState?.resolve(ok);
    setConfirmState(null);
  };

  return (
    <DialogContext.Provider value={{ toast, confirm }}>
      {children}

      {/* ── Toast stack ── */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id}
            className={`px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium
              animate-[fadeSlideIn_0.2s_ease] pointer-events-auto
              ${t.type === "success" ? "bg-emerald-500"
               : t.type === "error"  ? "bg-red-500"
               :                       "bg-gray-700"}`}>
            {t.msg}
          </div>
        ))}
      </div>

      {/* ── Confirm modal ── */}
      {confirmState && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-80 p-6 space-y-5">
            <p className="text-gray-800 text-sm font-medium leading-relaxed">
              {confirmState.msg}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleConfirm(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleConfirm(true)}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm hover:bg-red-600 transition"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}
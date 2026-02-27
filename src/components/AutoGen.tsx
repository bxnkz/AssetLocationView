// src/components/AutoGen.tsx
import { useState } from "react";

const AutoGen = ({ isOpen, onClose, onGenerate }: any) => {
  const [config, setConfig] = useState({
    roomWidth: 10,
    roomHeight: 8,
    deskWidth: 0.8,
    deskHeight: 0.6,
    spacingX: 0.5,
    spacingY: 1,
    totalDesks: 30,
    algorithm: "grid",
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-4 rounded-xl w-[320px] space-y-2">
        <h2 className="font-bold text-lg">Generate Layout</h2>

        {Object.keys(config).map((key) =>
          key !== "algorithm" ? (
            <input
              key={key}
              type="number"
              value={(config as any)[key]}
              onChange={(e) =>
                setConfig({
                  ...config,
                  [key]: Number(e.target.value),
                })
              }
              className="w-full border rounded px-2 py-1"
              placeholder={key}
            />
          ) : null
        )}

        <select
          value={config.algorithm}
          onChange={(e) =>
            setConfig({ ...config, algorithm: e.target.value })
          }
          className="w-full border rounded px-2 py-1"
        >
          <option value="grid">Grid</option>
          <option value="row-pattern">Row Pattern</option>
        </select>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 border py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={() => onGenerate(config)}
            className="flex-1 bg-blue-600 text-white py-2 rounded"
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutoGen;
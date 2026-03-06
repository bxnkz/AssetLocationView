import { useState } from "react";

const fieldLabels: Record<string, string> = {
  roomWidth: "Room Width (m)",
  roomHeight: "Room Height (m)",
  deskWidth: "Desk Width (m)",
  deskHeight: "Desk Height (m)",
  spacingX: "Spacing X (m)",
  spacingY: "Spacing Y (m)",
  totalDesks: "Total Desks",
};

interface AutoGenProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateAll: (config: any) => void;
}

const AutoGen = ({ isOpen, onClose, onGenerateAll }: AutoGenProps) => {
  const [config, setConfig] = useState({
    roomWidth: 10,
    roomHeight: 8,
    deskWidth: 0.8,
    deskHeight: 0.6,
    spacingX: 0.5,
    spacingY: 1,
    totalDesks: 30,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-4 rounded-xl w-[320px] space-y-3">
        <h2 className="font-bold text-lg">Generate Layouts</h2>

        {Object.keys(config).map((key) => (
          <div key={key} className="space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {fieldLabels[key]}
            </label>
            <input
              type="number"
              value={(config as any)[key]}
              onChange={(e) =>
                setConfig({
                  ...config,
                  [key]: Number(e.target.value),
                })
              }
              className="w-full border rounded px-2 py-1"
            />
          </div>
        ))}

        <div className="flex gap-2 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border py-2 rounded"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onGenerateAll(config)}
            className="flex-1 bg-blue-600 text-white py-2 rounded"
          >
            Generate All Layouts
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutoGen;
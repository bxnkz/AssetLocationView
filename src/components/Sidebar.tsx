interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onAddAsset: (name: string) => void;
}

const Sidebar = ({ open, onClose, onAddAsset }: SidebarProps) => {
  return (
    <div className={`absolute top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-bold">Asset</h2>
        <button onClick={onClose}>
          <i className="bi bi-x-lg text-xl"></i>
        </button>
      </div>
      <div className="p-4 space-y-2 overflow-y-auto h-full">
        {["Table", "Printer", "UPS", "Switch"].map((item) => (
          <div
            key={item}
            className="p-2 bg-gray-200 rounded cursor-pointer"
            onClick={() => onAddAsset(item)}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
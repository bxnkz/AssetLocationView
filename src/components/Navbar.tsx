import React from "react";
import "../index.css";

interface NavBarProps {
  name: string;
  onLogout: () => void;
}

const Navbar: React.FC<NavBarProps> = ({ name, onLogout }) => {
  return (
    <nav className="flex justify-end items-center bg-green-800 text-white px-5 py-2 shadow-md text-md font-medium">
      <div className="flex items-center gap-4">
        <span>Welcome, {name}</span>
        <button
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-700 text-black px-4 py-1.5 rounded-md border border-black transition-colors"
        >
          Log out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
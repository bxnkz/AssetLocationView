import React from "react";
import '../index.css';

interface NavBarProps {
  name: string;
  onLogout: () => void;
  selectedFloor: string;
  onFloorChange: (floor:string) => void;
}

const Navbar: React.FC<NavBarProps> = ({ name, onLogout,selectedFloor,onFloorChange }) => {
  return (
    <nav className="flex justify-between items-center bg-blue-900 text-white px-5 py-2 shadow-md">
      <img
        src="/img/TIPS-logo-white.png"
        alt="Logo"
        className="h-10"
      />
      <ul className="flex gap-5 m-0 p-0 list-none">
        <label htmlFor="">
          Select Site : 
          <select name="" id="" className="ml-2 rounded-md  bg-gray-400 border-black text-black">
            <option value="B4">B4</option>
            {/* <option value="Fl2">CD</option> */}
          </select>
        </label>

        <label htmlFor="">
          Select Floor : 
          <select name="" id="" value={selectedFloor} onChange={(e) => onFloorChange(e.target.value)} className="ml-2 rounded-md  bg-gray-400 border-2  border-black text-black">
            <option className="text-center" value="FL1">Floor 1</option>
            <option className="text-center" value="FL2">Floor 2</option>
            <option className="text-center" value="FL3_1">Floor 3-1</option>
            <option className="text-center" value="FL3_2">Floor 3-2</option>
            <option className="text-center" value="FL4">Floor 4</option>
          </select>
        </label>

         <label htmlFor="">
          Select Department : 
          <select name="" id="" className="ml-2 rounded-md  bg-gray-400 border-black text-black">
            <option value="Fl1">IT</option>
            <option value="Fl2">HR</option>
          </select>
        </label>
      </ul>
      <div className="flex items-center gap-2">
        <span>Welcome , {name}</span>
        <button
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-700 text-black outline-black px-3 py-1 rounded-md border border-black"
        >
          Log out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
import React, { useEffect } from "react";
import "../index.css";

interface NavBarProps {
  name: string;
  onLogout: () => void;

  selectedFloor: string;
  onFloorChange: (floor: string) => void;

  selectedSite: string;
  onSiteChange: (site: string) => void;

  selectedDepartment: string;
  onDepartmentChange: (dept: string) => void;
}

const floorToDeptMap: { [key: string]: string[] } = {
  FL1: ["Eq", "She", "Operator"],
  FL2: ["Pairin", "Nurse"],
  FL3_1: ["Account", "IT"],
  FL3_2: ["Server", "GA"],
  FL4: ["Petch", "President", "Marketting/secretary", "SP/CY"],
};

const deptToFloorMap: { [key: string]: string } = {};
Object.entries(floorToDeptMap).forEach(([floor, depts]) => {
  depts.forEach((dept) => {
    deptToFloorMap[dept] = floor;
  });
});

const allDepartments = Object.values(floorToDeptMap).flat().sort();

const Navbar: React.FC<NavBarProps> = ({
  name,
  onLogout,
  selectedFloor,
  onFloorChange,
  selectedSite,
  onSiteChange,
  selectedDepartment,
  onDepartmentChange,
}) => {
  useEffect(() => {
    const deptsOnCurrentFloor = floorToDeptMap[selectedFloor] || [];
    if (
      selectedDepartment &&
      !deptsOnCurrentFloor.includes(selectedDepartment)
    ) {
      onDepartmentChange("");
    }
  }, [selectedFloor, selectedDepartment, onDepartmentChange]);
  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDept = e.target.value;
    onDepartmentChange(newDept);
    if (newDept) {
      const newFloor = deptToFloorMap[newDept];
      if (newFloor && newFloor !== selectedFloor) {
        onFloorChange(newFloor);
      }
    }
  };

  return (
    <nav className="flex flex-wrap md:flex-nowrap justify-between items-center bg-blue-900 text-white px-5 py-2 shadow-md text-md font-medium">
      <img
        src="/img/TIPS-logo-white.png"
        alt="Logo"
        className="h-8 md:h-10 order-1"
      />
      <div className="flex items-center gap-2 order-2 md:order-3">
        <span>Welcome , {name}</span>
        <button
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-700 text-black outline-black px-3 py-1 rounded-md border border-black"
        >
          Log out
        </button>
      </div>
      <div className="w-full md:w-auto order-3 md:order-2 mt-4 md:mt-0">
        <ul className="flex flex-col md:flex-row gap-4 md:gap-5 m-0 p-0 list-none">
          <label
            className="flex flex-col md:flex-row md:items-center"
            htmlFor=""
          >
            Select Site :
            <select
              name=""
              id=""
              value={selectedSite}
              onChange={(e) => onSiteChange(e.target.value)}
              className="md:ml-2 rounded-full bg-gray-400 border-black text-black"
            >
              <option className="text-center" value="B4">
                B4
              </option>
            </select>
          </label>
          <label
            className="flex flex-col md:flex-row md:items-center"
            htmlFor=""
          >
            Select Floor :
            <select
              name=""
              id=""
              value={selectedFloor}
              onChange={(e) => onFloorChange(e.target.value)}
              className="md:ml-2 rounded-full  bg-gray-400 border-black text-black"
            >
              <option className="text-center" value="FL1">
                Floor 1
              </option>
              <option className="text-center" value="FL2">
                Floor 2
              </option>
              <option className="text-center" value="FL3_1">
                Floor 3-1
              </option>
              <option className="text-center" value="FL3_2">
                Floor 3-2
              </option>
              <option className="text-center" value="FL4">
                Floor 4
              </option>
            </select>
          </label>
          <label
            className="flex flex-col md:flex-row md:items-center"
            htmlFor=""
          >
            Select Department :
            <select
              name=""
              id=""
              value={selectedDepartment}
              onChange={handleDepartmentChange} 
              className="md:ml-2 rounded-full bg-gray-400 border-black text-black"
            >
              <option className="text-center" value="">
                -- Select Dept --
              </option>
              {allDepartments.map((dept) => (
                <option className="text-center" key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </label>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
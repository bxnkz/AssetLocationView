import React from "react";
import "./Navbar.css";

interface NavBarProps {
  name: string;
  onLogout: () => void;
}

const Navbar: React.FC<NavBarProps> = ({ name, onLogout }) => {
  return (
    <nav className="navbar">
      <img src="./src/img/TIPS-logo-white.png" alt="Logo" className="logo" />
      <ul className="menu">
        <li><a href="/">Test</a></li>
      </ul>
      <div className="user">
        <span>{name}</span>
        <button onClick={onLogout} className="logout-btn">
          Log out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
// src/components/NavPanel.js
import React from "react";
import { Link } from "react-router-dom";
import "./NavPanel.css";

const NavPanel = () => {
  const handleClick = (buttonName) => {
    alert(`${buttonName} button clicked!`);
  };

  return (
    <nav className="nav-panel">
      <ul>
        {/* <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About</Link></li>
        */
        }
        <li>
          <button onClick={() => handleClick("Navigation")}>Navigation</button>
        </li>
        <li>
          <button onClick={() => handleClick("Mapping")}>Mapping</button>
        </li>
        <li>
          <button onClick={() => handleClick("Remapping")}>Remapping</button>
        </li>
      </ul>
    </nav>
  );
};

export default NavPanel;

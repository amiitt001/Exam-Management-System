import React from "react";
import {
  FiFileText,
  FiGrid,
  FiUserCheck,
  FiCalendar,
  FiCpu,
} from "react-icons/fi";
import { NavLink } from "react-router-dom";

const menu = [
  { name: "Exam Paper Generator", icon: <FiFileText />, path: "/generator" },
  { name: "Seating Arrangement", icon: <FiGrid />, path: "/seating" },
  { name: "Invigilator Allocation", icon: <FiUserCheck />, path: "/invigilation" },
  { name: "Exam Schedule", icon: <FiCalendar />, path: "/schedule" },
  { name: "AI Analytics", icon: <FiCpu />, path: "/analytics" },
];

const Sidebar = ({ isOpen }) => {
  return (
    <div
      className={`
        fixed top-0 left-0 h-full w-64 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800 shadow-lg py-6 px-4 z-50
        transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
    >
      <h2 className="text-white text-xl font-bold mb-6 pl-2">
        Exam Management
      </h2>

      <nav className="space-y-2">
        {menu.map((item, i) => (
          <NavLink
            key={i}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 text-md px-4 py-3 rounded-lg transition-all
              ${
                isActive
                  ? "bg-blue-500/20 text-blue-400 border border-blue-400/40"
                  : "text-gray-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;

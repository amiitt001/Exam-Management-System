import React from "react";
import { FiBell, FiMenu, FiUser } from "react-icons/fi";

const Navbar = ({ toggleSidebar }) => {
  return (
    <div className="w-full bg-slate-900/60 backdrop-blur-lg border-b border-slate-800 px-6 py-4 flex items-center justify-between shadow">
      
      {/* Mobile Menu Button */}
      <button
        className="text-white text-2xl lg:hidden"
        onClick={toggleSidebar}
      >
        <FiMenu />
      </button>

      <h2 className="text-white text-xl font-semibold hidden lg:block">
        Exam Management System
      </h2>

      <div className="flex items-center gap-6">
        <FiBell className="text-gray-300 text-xl cursor-pointer hover:text-white transition" />
        <button className="flex items-center gap-2 bg-slate-800 rounded-full px-3 py-1 text-gray-200 hover:bg-slate-700 transition">
          <FiUser /> Admin
        </button>
      </div>
    </div>
  );
};

export default Navbar;

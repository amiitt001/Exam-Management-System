import React from "react";
import { FiBell, FiMenu, FiUser, FiSearch } from "react-icons/fi";

const Navbar = ({ toggleSidebar }) => {
  return (
    <div className="w-full bg-void/50 backdrop-blur-xl border-b border-white/5 px-8 h-[72px] flex items-center justify-between relative z-[30]">

      {/* Search Bar - Aesthetic Only */}
      <div className="hidden md:flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2 w-96 group focus-within:border-teal-500/50 transition-all">
        <FiSearch className="text-slate-500 group-focus-within:text-teal-400" />
        <input
          type="text"
          placeholder="Search for papers, rooms..."
          className="bg-transparent border-none outline-none text-sm text-slate-300 placeholder:text-slate-600 w-full"
        />
      </div>

      {/* Mobile Menu Button */}
      <button
        className="text-white text-2xl lg:hidden"
        onClick={toggleSidebar}
      >
        <FiMenu />
      </button>

      <div className="flex items-center gap-6">
        <div className="relative cursor-pointer group">
          <FiBell className="text-slate-400 text-xl group-hover:text-teal-400 transition-colors" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-teal-500 rounded-full border-2 border-void animate-pulse"></span>
        </div>

        <div className="h-8 w-px bg-white/10 mx-2"></div>

        <button className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full pl-2 pr-4 py-1.5 text-slate-200 hover:bg-white/10 transition-all group">
          <div className="w-7 h-7 bg-teal-500/20 rounded-full flex items-center justify-center text-teal-400 text-[10px] font-bold border border-teal-500/20">
            AD
          </div>
          <span className="text-xs font-bold tracking-wide group-hover:text-teal-400 transition-colors">Admin Beta</span>
        </button>
      </div>
    </div>
  );
};

export default Navbar;

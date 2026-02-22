import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiFileText,
  FiUsers,
  FiCheckSquare,
  FiCalendar,
  FiPieChart,
  FiHome
} from 'react-icons/fi';

const Sidebar = () => {
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <FiHome size={20} /> },
    { path: '/generate-paper', label: 'Paper Gen', icon: <FiFileText size={20} /> },
    { path: '/seating', label: 'Seating', icon: <FiCheckSquare size={20} /> },
    { path: '/invigilator', label: 'Invigilation', icon: <FiUsers size={20} /> },
    { path: '/schedule', label: 'Schedule', icon: <FiCalendar size={20} /> },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-card backdrop-blur-xl border-r border-white/5 h-full relative z-[20]">
      <div className="p-8">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded flex items-center justify-center font-serif font-black text-slate-900 text-sm shadow-[0_0_15px_rgba(0,229,195,0.3)]">
            E
          </div>
          <span className="text-xl font-serif font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-400">
            ExamGen
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                                flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 no-underline
                                ${isActive
                  ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-[0_0_20px_rgba(0,229,195,0.1)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}
                            `}
            >
              <span className="flex items-center">
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="p-6 mt-auto">
        <div className="bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-2xl p-6 border border-teal-500/10">
          <p className="text-xs font-bold text-teal-400 uppercase tracking-widest mb-2">Pro Plan</p>
          <p className="text-sm text-slate-300 mb-4">AI generation enabled.</p>
          <button className="w-full bg-white/5 hover:bg-white/10 text-white text-xs font-bold py-2 rounded-lg transition-colors border border-white/5">
            Manage
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

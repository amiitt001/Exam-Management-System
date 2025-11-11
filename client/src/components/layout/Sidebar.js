import React from 'react';
import { NavLink } from 'react-router-dom';
// You will also need to import your icons
// import { FaWpforms, FaUsers, FaTasks, FaCalendarAlt, FaChartBar } from 'react-icons/fa';

const Sidebar = () => {
  // Helper class for NavLink
  const getNavLinkClass = ({ isActive }) => {
    return isActive
      ? 'flex items-center p-2 text-white bg-blue-600 rounded-md'
      : 'flex items-center p-2 text-gray-300 hover:bg-gray-700 rounded-md';
  };

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col p-4">
      <h1 className="text-2xl font-bold mb-6">Exam Management</h1>
      <nav>
        <ul>
          <li className="mb-2">
            <NavLink to="/generate-paper" className={getNavLinkClass}>
              {/* <FaWpforms className="mr-3" /> */}
              Exam Paper Generator
            </NavLink>
          </li>
          <li className="mb-2">
            <NavLink to="/seating" className={getNavLinkClass}>
              {/* <FaUsers className="mr-3" /> */}
              Seating Arrangement
            </NavLink>
          </li>
          <li className="mb-2">
            <NavLink to="/invigilator" className={getNavLinkClass}>
              {/* <FaTasks className="mr-3" /> */}
              Invigilator Allocation
            </NavLink>
          </li>
          <li className="mb-2">
            <NavLink to="/schedule" className={getNavLinkClass}>
              {/* <FaCalendarAlt className="mr-3" /> */}
              Exam Schedule
            </NavLink>
          </li>
          <li className="mb-2">
            <NavLink to="/" className={getNavLinkClass} end>
              {/* <FaChartBar className="mr-3" /> */}
              AI Analytics
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
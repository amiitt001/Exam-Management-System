import React from "react";
import { FiUsers, FiCheckSquare, FiCpu, FiCalendar } from "react-icons/fi";

const dashboardCards = [
  {
    icon: <FiCheckSquare size={26} />,
    title: "Papers Generated",
    value: 42,
  },
  {
    icon: <FiUsers size={26} />,
    title: "Invigilators Assigned",
    value: 18,
  },
  {
    icon: <FiCalendar size={26} />,
    title: "Exams Scheduled",
    value: 6,
  },
  {
    icon: <FiCpu size={26} />,
    title: "AI Analytics Reports",
    value: 12,
  },
];

const Dashboard = () => {
  return (
    <div className="p-4">
      <h2 className="text-2xl text-white font-semibold mb-6">Dashboard Overview</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {dashboardCards.map((card, index) => (
          <div
            key={index}
            className="bg-slate-800/40 border border-slate-700 backdrop-blur shadow-lg rounded-xl p-5 flex items-center gap-4
                       hover:bg-slate-800/60 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <div className="text-blue-400">{card.icon}</div>
            <div>
              <p className="text-gray-300 text-sm">{card.title}</p>
              <h3 className="text-xl font-bold text-white">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-slate-800/40 border border-slate-700 backdrop-blur rounded-xl p-6">
        <h3 className="text-white text-xl font-semibold mb-3">System Activity</h3>
        <p className="text-gray-400 text-sm">
          More analytics, exam statistics and reports will appear here.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;

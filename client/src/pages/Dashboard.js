import React from "react";
import { FiUsers, FiCheckSquare, FiCpu, FiCalendar, FiActivity, FiZap } from "react-icons/fi";

const dashboardCards = [
  {
    icon: <FiCheckSquare size={24} />,
    title: "Papers Generated",
    value: "42",
    color: "from-teal-400/20 to-teal-400/5",
    accent: "text-teal-400",
  },
  {
    icon: <FiUsers size={24} />,
    title: "Invigilators Assigned",
    value: "18",
    color: "from-cyan-400/20 to-cyan-400/5",
    accent: "text-cyan-400",
  },
  {
    icon: <FiCalendar size={24} />,
    title: "Exams Scheduled",
    value: "06",
    color: "from-amber-400/20 to-amber-400/5",
    accent: "text-amber-400",
  },
  {
    icon: <FiCpu size={24} />,
    title: "AI Efficiency Index",
    value: "94%",
    color: "from-rose-400/20 to-rose-400/5",
    accent: "text-rose-400",
  },
];

const Dashboard = () => {
  return (
    <div className="space-y-10 animate-fade-in">

      <div>
        <span className="text-teal-400 font-bold tracking-[0.2em] text-[10px] uppercase mb-2 block">System Analytics</span>
        <h2 className="font-serif text-3xl font-bold text-white mb-8">Executive Overview</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardCards.map((card, index) => (
            <div
              key={index}
              className={`bg-card backdrop-blur-xl border border-white/5 rounded-[24px] p-8 flex flex-col justify-between
                         hover:border-white/20 transition-all cursor-pointer group hover:-translate-y-1`}
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center ${card.accent} mb-6 border border-white/5 group-hover:scale-110 transition-transform`}>
                {card.icon}
              </div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{card.title}</p>
                <h3 className="text-3xl font-serif font-black text-white">{card.value}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card backdrop-blur-xl border border-white/5 rounded-[32px] p-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-teal-400 rounded-full"></div>
              <h3 className="font-serif text-xl font-bold text-white">System Activity</h3>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Real-time
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.05] transition-colors">
              <div className="w-10 h-10 bg-teal-500/10 rounded-lg flex items-center justify-center text-teal-400">
                <FiZap size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white mb-0.5">Gemini Engine <span className="text-slate-500 font-normal">optimized paper generator.</span></p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">2 minutes ago</p>
              </div>
              <FiActivity className="text-slate-700" />
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.05] transition-colors">
              <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center text-cyan-400">
                <FiUsers size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white mb-0.5">Seating Plan <span className="text-slate-500 font-normal">assigned to Room 402.</span></p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">15 minutes ago</p>
              </div>
              <FiActivity className="text-slate-700" />
            </div>

            <div className="p-10 text-center border-2 border-dashed border-white/5 rounded-3xl mt-6">
              <p className="text-slate-500 text-sm font-light leading-relaxed">
                More advanced analytics, exam statistics trajectories, <br /> and AI-driven reports will be available soon.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-500/20 to-cyan-500/20 backdrop-blur-2xl border border-teal-500/20 rounded-[32px] p-10 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center text-teal-400 mb-6 border border-teal-500/20 shadow-[0_0_40px_rgba(0,229,195,0.2)]">
            <FiCpu size={40} className="animate-pulse" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-white mb-4">Neural Engine</h3>
          <p className="text-slate-300 text-sm leading-relaxed mb-8 font-light">
            Our AI models are currently calculating optimal faculty allocations for the next session.
          </p>
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-2">
            <div className="w-2/3 h-full bg-teal-400 shadow-[0_0_10px_#00e5c3]"></div>
          </div>
          <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">Processing Allocations...</p>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;

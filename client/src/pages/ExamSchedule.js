import React, { useState } from 'react';
import { FiCalendar, FiClock, FiBook, FiCheckCircle, FiInfo, FiZap } from 'react-icons/fi';

const ExamSchedule = () => {
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState(null);

  const generateSchedule = () => {
    setLoading(true);
    // Simulate complex computation
    setTimeout(() => {
      setSchedule([
        {
          id: 1, date: 'May 12, 2025', subjects: [
            { time: '09:00 AM', name: 'Quantum Physics II', code: 'PH402', room: 'Arena 1' },
            { time: '02:00 PM', name: 'Neural Networks', code: 'CS508', room: 'Cluster B' }
          ]
        },
        {
          id: 2, date: 'May 14, 2025', subjects: [
            { time: '09:00 AM', name: 'Cyber Security', code: 'CS901', room: 'Lab 4' },
            { time: '02:00 PM', name: 'Discrete Math', code: 'MA102', room: 'Main Hall' }
          ]
        },
        {
          id: 3, date: 'May 16, 2025', subjects: [
            { time: '10:00 AM', name: 'Ethical Hacking', code: 'CS882', room: 'Cyber Lab' }
          ]
        }
      ]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-20">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-teal-400 font-bold tracking-[0.2em] text-[10px] uppercase mb-2 block">Temporal Logic</span>
          <h2 className="font-serif text-3xl font-bold text-white flex items-center gap-3">
            <FiCalendar className="text-teal-400" />
            Exam Schedule
          </h2>
        </div>
        {!schedule && (
          <button
            onClick={generateSchedule}
            disabled={loading}
            className="bg-gradient-to-br from-teal-400 to-cyan-500 text-slate-950 font-black px-8 py-3 rounded-2xl hover:shadow-[0_0_30px_rgba(0,229,195,0.4)] transition-all flex items-center gap-2"
          >
            {loading ? <span className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></span> : <><FiZap /> Synthesize Timeline</>}
          </button>
        )}
      </div>

      {!schedule ? (
        <div className="grid lg:grid-cols-3 gap-8 text-white">
          <div className="lg:col-span-2 bg-card backdrop-blur-xl border border-white/5 rounded-[40px] p-12 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-teal-500/10 rounded-full flex items-center justify-center text-teal-400 mb-8 border border-teal-500/20">
              <FiClock size={48} className="animate-pulse" />
            </div>
            <h3 className="text-2xl font-serif font-bold mb-4">No Timeline Generated</h3>
            <p className="text-slate-400 max-w-md font-light leading-relaxed">
              Our conflict-free engine requires the subject list and student counts to architect a localized examination schedule.
            </p>
            <div className="mt-10 flex gap-4">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600">
                <div className="w-2 h-2 bg-teal-500/50 rounded-full"></div> Constraint Based
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600">
                <div className="w-2 h-2 bg-cyan-500/50 rounded-full"></div> Gap Optimized
              </div>
            </div>
          </div>

          <div className="bg-teal-500/5 border border-teal-500/10 rounded-[40px] p-10 space-y-8">
            <FiInfo className="text-teal-400" size={32} />
            <h4 className="text-xl font-bold">Optimization Engine</h4>
            <div className="space-y-6">
              {[
                { title: 'Conflict Resolution', desc: 'Ensures no student has overlapping examinations.' },
                { title: 'Gap Analysis', desc: 'Maintains optimal study intervals between major papers.' },
                { title: 'Room Balancing', desc: 'Distributes load across campus facilities evenly.' }
              ].map((feature, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest">{feature.title}</p>
                  <p className="text-slate-400 text-sm font-light">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-10 animate-fade-up">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {schedule.map((day, dIdx) => (
              <div key={day.id} className="bg-card backdrop-blur-xl border border-white/5 rounded-[40px] overflow-hidden shadow-2xl group transition-all hover:border-teal-500/30">
                <div className="bg-white/5 px-8 py-6 border-b border-white/5">
                  <h3 className="text-teal-400 font-bold uppercase tracking-widest text-xs mb-1">Session {day.id}</h3>
                  <p className="text-white font-serif text-xl font-bold">{day.date}</p>
                </div>
                <div className="p-8 space-y-6">
                  {day.subjects.map((sub, sIdx) => (
                    <div key={sIdx} className="relative pl-6 border-l border-white/10 hover:border-teal-400 transition-colors">
                      <div className="absolute -left-[5px] top-1.5 w-[9px] h-[9px] bg-void border-2 border-slate-700 rounded-full group-hover:border-teal-400 transition-colors"></div>
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-white font-bold text-sm tracking-tight">{sub.name}</p>
                        <p className="text-[10px] font-black text-slate-500 uppercase">{sub.time}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-teal-500/80 font-bold uppercase tracking-widest">{sub.code}</span>
                        <div className="w-1 h-1 bg-white/10 rounded-full"></div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{sub.room}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white/5 border border-white/5 rounded-[32px] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-400 shadow-[0_0_15px_rgba(0,229,195,0.2)]">
                <FiCheckCircle size={24} />
              </div>
              <div>
                <p className="text-white font-bold">Schedule Finalized</p>
                <p className="text-slate-500 text-xs">All constraints satisfied by the neural architect.</p>
              </div>
            </div>
            <button
              onClick={() => setSchedule(null)}
              className="text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors border-b border-transparent hover:border-white pb-1"
            >
              Recalculate Constraints
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamSchedule;

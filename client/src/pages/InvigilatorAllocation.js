import React, { useState } from 'react';
import axios from 'axios';
import { FiUsers, FiCalendar, FiCheckCircle, FiAlertCircle, FiPlus, FiArrowRight } from 'react-icons/fi';

const InvigilatorAllocation = () => {
  const [invigilatorsText, setInvigilatorsText] = useState('');
  const [sessionsText, setSessionsText] = useState('Common Room A: 09:00 - 12:00\nLecture Hall B: 14:00 - 17:00');
  const [assignments, setAssignments] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const parseInvigilators = (text) => text.split('\n').map(s => s.trim()).filter(Boolean).map((name, i) => ({ id: `I${i + 1}`, name }));
  const parseSessions = (text) => text.split('\n').map(s => s.trim()).filter(Boolean).map((line, i) => {
    const parts = line.split(':').map(p => p.trim());
    return { id: `S${i + 1}`, exam: parts[0] || `Block ${i + 1}`, room: parts[0] || 'Unspecified', time: parts[1] || 'TBD' };
  });

  const handleAssign = async (e) => {
    e.preventDefault();
    setError(null);
    setAssignments(null);
    const invigilators = parseInvigilators(invigilatorsText);
    const sessions = parseSessions(sessionsText);
    if (invigilators.length === 0) { setError('Please enter at least one invigilator'); return; }
    if (sessions.length === 0) { setError('Please enter at least one session'); return; }

    setLoading(true);
    try {
      const resp = await axios.post(`${process.env.REACT_APP_API_URL}/api/assign-invigilators-mock`, { invigilators, sessions });
      setAssignments(resp.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Allocation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-20">

      {/* Header */}
      <div>
        <span className="text-teal-400 font-bold tracking-[0.2em] text-[10px] uppercase mb-2 block">Resource Management</span>
        <h2 className="font-serif text-3xl font-bold text-white flex items-center gap-3">
          <FiUsers className="text-teal-400" />
          Invigilator Allocation
        </h2>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">

        {/* INPUT PANEL */}
        <div className="space-y-8">
          <div className="bg-card backdrop-blur-xl border border-white/5 rounded-[40px] p-10 shadow-2xl">
            <form onSubmit={handleAssign} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <FiUsers className="text-teal-500" /> Faculty Personnel (One per line)
                </label>
                <textarea
                  value={invigilatorsText}
                  onChange={e => setInvigilatorsText(e.target.value)}
                  rows={6}
                  className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 text-white text-sm placeholder-slate-700 focus:border-teal-500/50 outline-none transition-all resize-none"
                  placeholder="Dr. Sarah Johnson&#10;Prof. Alan Turing&#10;Dr. Grace Hopper"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <FiCalendar className="text-cyan-500" /> Time Slots (Room: Time Slot)
                </label>
                <textarea
                  value={sessionsText}
                  onChange={e => setSessionsText(e.target.value)}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 text-white text-sm placeholder-slate-700 focus:border-teal-500/50 outline-none transition-all resize-none"
                  placeholder="Main Hall: 09:00 - 11:30&#10;Lab 402: 13:00 - 15:30"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-br from-teal-400 to-cyan-500 text-slate-950 font-black py-5 rounded-[24px] hover:shadow-[0_0_30px_rgba(0,229,195,0.4)] transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 group"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></span>
                ) : (
                  <>
                    Solve Allocation
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex gap-3">
                <FiAlertCircle className="text-rose-400 shrink-0" size={18} />
                <p className="text-xs font-bold text-rose-300 uppercase tracking-widest leading-relaxed">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* RESULTS PANEL */}
        <div className="lg:min-h-[600px]">
          {!assignments ? (
            <div className="h-full border-2 border-dashed border-white/5 rounded-[40px] flex flex-col items-center justify-center text-center p-12">
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-slate-700 mb-6">
                <FiCheckCircle size={40} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Awaiting Computation</h3>
              <p className="text-slate-500 max-w-xs font-light">Enter the personnel and session data to generate a balanced allocation matrix.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4">Optimized Schedule</h3>
              {(() => {
                let sessionsView = [];
                if (assignments.sessions && Array.isArray(assignments.sessions)) {
                  sessionsView = assignments.sessions;
                } else if (Array.isArray(assignments)) {
                  const map = new Map();
                  assignments.forEach(inv => {
                    (inv.sessions || []).forEach(s => {
                      const existing = map.get(s.id) || { id: s.id, exam: s.exam || s.name || s.id, room: s.room || '', time: s.time || '', required: s.required || 1, assigned: [] };
                      existing.assigned.push({ id: inv.invigilator.id, name: inv.invigilator.name });
                      map.set(s.id, existing);
                    });
                  });
                  sessionsView = Array.from(map.values());
                }

                if (sessionsView.length === 0) return (
                  <div className="p-8 bg-white/5 rounded-3xl text-center border border-white/5">
                    <p className="text-slate-500 text-sm italic">No valid assignments produced by logic core.</p>
                  </div>
                );

                return (
                  <div className="space-y-4">
                    {sessionsView.map((s, idx) => (
                      <div key={s.id} className="bg-card backdrop-blur-xl border border-white/10 p-8 rounded-3xl animate-fade-up shadow-xl hover:border-teal-500/30 transition-all group" style={{ animationDelay: `${idx * 100}ms` }}>
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse shadow-[0_0_8px_#00e5c3]"></span>
                              <h4 className="text-white font-serif text-xl font-bold">{s.room}</h4>
                            </div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.time}</p>
                          </div>
                          <div className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                            <span className="text-[9px] font-black text-teal-400 uppercase tracking-widest">{s.assigned.length} Allocated</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {s.assigned.length > 0 ? (
                            <div className="flex flex-wrap gap-3">
                              {s.assigned.map(inv => (
                                <div key={inv.id} className="bg-white/5 px-4 py-2 rounded-xl border border-white/5 text-xs text-slate-300 font-medium hover:bg-white/10 transition-colors cursor-default">
                                  {inv.name}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl flex items-center gap-3">
                              <FiAlertCircle className="text-orange-400" size={16} />
                              <span className="text-[10px] font-black text-orange-300 uppercase tracking-widest">Unstaffed Slot</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvigilatorAllocation;

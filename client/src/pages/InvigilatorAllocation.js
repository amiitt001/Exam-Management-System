import React, { useState } from 'react';
import axios from 'axios';

const InvigilatorAllocation = () => {
  const [invigilatorsText, setInvigilatorsText] = useState('');
  const [sessionsText, setSessionsText] = useState('Exam1:RoomA:09:00-11:00\nExam2:RoomB:12:00-14:00');
  const [assignments, setAssignments] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const parseInvigilators = (text) => text.split('\n').map(s => s.trim()).filter(Boolean).map((name, i) => ({ id: `I${i + 1}`, name }));
  // Parse sessions: ExamId:Room:Time
  const parseSessions = (text) => text.split('\n').map(s => s.trim()).filter(Boolean).map((line, i) => {
    const parts = line.split(':').map(p => p.trim());
    return { id: `S${i + 1}`, exam: parts[0] || `Exam${i + 1}`, room: parts[1] || 'RoomX', time: parts[2] || '' };
  });

  const handleAssign = async (e) => {
    e.preventDefault();
    setError(null);
    setAssignments(null);
    const invigilators = parseInvigilators(invigilatorsText);
    const sessions = parseSessions(sessionsText);
    if (invigilators.length === 0) { setError('No invigilators provided'); return; }
    if (sessions.length === 0) { setError('No sessions provided'); return; }

    setLoading(true);
    try {
      const resp = await axios.post(`${process.env.REACT_APP_API_URL}/api/assign-invigilators-mock`, { invigilators, sessions });
      setAssignments(resp.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg animate-fade-in">
      <h2 className="text-xl font-semibold mb-4">Invigilator Allocation (Load-balanced)</h2>
      <form onSubmit={handleAssign} className="space-y-4 max-w-3xl">
        <div>
          <label className="block text-sm font-medium text-gray-300">Invigilators (one per line)</label>
          <textarea value={invigilatorsText} onChange={e => setInvigilatorsText(e.target.value)} rows={6} className="mt-2 w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm" placeholder="Dr. A\nProf. B\nMs. C" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300">Sessions (one per line as Exam:Room:Time)</label>
          <textarea value={sessionsText} onChange={e => setSessionsText(e.target.value)} rows={6} className="mt-2 w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm" placeholder="Exam1:RoomA:09:00-11:00\nExam2:RoomB:12:00-14:00" />
        </div>

        <div>
          <button type="submit" disabled={loading} className="inline-flex items-center gap-3 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 active:scale-95 transition-transform text-white px-4 py-2 rounded-md">
            {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-teal-400 rounded-full animate-spin" aria-hidden />}
            <span>{loading ? 'Allocating...' : 'Allocate Invigilators'}</span>
          </button>
        </div>
      </form>

      {error && <div style={{ color: 'red', marginTop: 12 }}>Error: {error}</div>}

      {assignments && (
        <div style={{ marginTop: 20, textAlign: 'left' }}>
          <h3>Assignments (by session)</h3>
          {/* Normalize to session-centric view whether API returned sessions or invigilator map */}
          {(() => {
            let sessionsView = [];
            // If server returned an object with `sessions` array (session-centric)
            if (assignments.sessions && Array.isArray(assignments.sessions)) {
              sessionsView = assignments.sessions;
            } else if (Array.isArray(assignments)) {
              // server returned invigilator-centric map: [{ invigilator, sessions: [...] }, ...]
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

            if (sessionsView.length === 0) return <div>No assignments returned.</div>;

            return (
              <div>
                {sessionsView.map((s, idx) => (
                  <div key={s.id} className="opacity-0 animate-fade-up" style={{ animationDelay: `${idx * 30}ms`, marginBottom: 12 }}>
                    <strong>{s.exam}</strong> — {s.room} <em>({s.time})</em>
                    <div>Assigned invigilators:</div>
                    {s.assigned && s.assigned.length > 0 ? (
                      <ul>
                        {s.assigned.map(inv => <li key={inv.id}>{inv.name} ({inv.id})</li>)}
                      </ul>
                    ) : (
                      <div className="text-orange-400">None assigned</div>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default InvigilatorAllocation;

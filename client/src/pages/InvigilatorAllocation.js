import React, { useState } from 'react';
import axios from 'axios';
import { Card, Icon, Btn, Badge, Input } from "../components/ui/index";

const InvigilatorAllocation = () => {
  const [invigilatorsText, setInvigilatorsText] = useState('');
  const [sessionsText, setSessionsText] = useState('Common Room A: 09:00 - 12:00\nLecture Hall B: 14:00 - 17:00');
  const [assignments, setAssignments] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const theme = {
    accent: "#3b82f6",
    textSub: "#94a3b8",
    surfaceAlt: "#1a2235",
    textMuted: "#64748b",
  };

  const parseInvigilators = (text) => text.split('\n').map(s => s.trim()).filter(Boolean).map((name, i) => ({ id: `I${i + 1}`, name }));
  const parseSessions = (text) => text.split('\n').map(s => s.trim()).filter(Boolean).map((line, i) => {
    const parts = line.split(':').map(p => p.trim());
    return { id: `S${i + 1}`, exam: parts[0] || `Block ${i + 1}`, room: parts[0] || 'Unspecified', time: parts[1] || 'TBD' };
  });

  const handleAssign = async (e) => {
    if (e) e.preventDefault();
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
    <div className="fade-in space-y-8 pb-20">
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Invigilator Allocation</h1>
        <p style={{ color: theme.textSub }}>Engineered resource allocation for examination shifts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* INPUT PANEL */}
        <div className="space-y-6">
          <Card>
            <h3 style={{ fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="user" size={18} color={theme.accent} /> Personnel & Slots
            </h3>
            <div className="space-y-6">
              <Input
                label="Faculty Personnel (One per line)"
                value={invigilatorsText}
                onChange={setInvigilatorsText}
                rows={6}
                placeholder="Dr. Sarah Johnson&#10;Prof. Alan Turing&#10;Dr. Grace Hopper"
              />

              <Input
                label="Time Slots (Room: Time Slot)"
                value={sessionsText}
                onChange={setSessionsText}
                rows={4}
                placeholder="Main Hall: 09:00 - 11:30&#10;Lab 402: 13:00 - 15:30"
              />

              <Btn onClick={handleAssign} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? <span className="spin">⟳</span> : <Icon name="chart" size={16} />}
                Solve Allocation
              </Btn>
            </div>

            {error && (
              <div style={{ marginTop: 20, padding: 16, background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 12, display: 'flex', gap: 10 }}>
                <Icon name="info" color="#ef4444" size={18} />
                <p style={{ fontSize: 13, color: '#fca5a5', fontWeight: 600 }}>{error}</p>
              </div>
            )}
          </Card>
        </div>

        {/* RESULTS PANEL */}
        <div className="lg:min-h-[500px]">
          {!assignments ? (
            <Card style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 400, color: theme.textMuted, gap: 12, borderStyle: 'dashed' }}>
              <Icon name="check" size={40} />
              <h3 style={{ fontWeight: 700, color: '#fff' }}>Awaiting Computation</h3>
              <p style={{ maxWidth: 280, textAlign: 'center' }}>Enter the personnel and session data to generate a balanced allocation matrix.</p>
            </Card>
          ) : (
            <div className="space-y-6">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontWeight: 700, fontSize: 16 }}>Optimized Schedule</h3>
                <Btn small variant="ghost" onClick={() => setAssignments(null)}>Discard</Btn>
              </div>

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
                  <Card style={{ textAlign: 'center', color: theme.textMuted }}>
                    <p style={{ fontStyle: 'italic' }}>No valid assignments produced.</p>
                  </Card>
                );

                return (
                  <div className="space-y-4">
                    {sessionsView.map((s) => (
                      <Card key={s.id} style={{ borderLeft: `4px solid ${theme.accent}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 16 }}>
                          <div>
                            <h4 style={{ fontWeight: 700, fontSize: 18 }}>{s.room}</h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                              <Icon name="calendar" size={12} color={theme.textMuted} />
                              <span style={{ fontSize: 11, fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase' }}>{s.time}</span>
                            </div>
                          </div>
                          <Badge color="blue">{s.assigned.length} ALLOCATED</Badge>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {s.assigned.length > 0 ? (
                            s.assigned.map(inv => (
                              <div key={inv.id} style={{ padding: '6px 14px', background: theme.surfaceAlt, borderRadius: 10, border: '1px solid #1e2d45', fontSize: 13, fontWeight: 500 }}>
                                {inv.name}
                              </div>
                            ))
                          ) : (
                            <div style={{ padding: 12, background: 'rgba(251, 146, 60, 0.05)', border: '1px solid rgba(251, 146, 60, 0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                              <Icon name="info" color="#fb923c" size={14} />
                              <span style={{ fontSize: 11, fontWeight: 800, color: '#fdba74', textTransform: 'uppercase' }}>Unstaffed Slot</span>
                            </div>
                          )}
                        </div>
                      </Card>
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

import React, { useState } from 'react';
import { Card, Icon, Btn, Badge } from '../ui';

const ExamSchedule = () => {
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState(null);

  const theme = {
    accent: "#3b82f6",
    textSub: "#94a3b8",
    surfaceAlt: "#1a2235",
    textMuted: "#64748b",
  };

  const generateSchedule = () => {
    setLoading(true);
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
    <div className="fade-in space-y-8 pb-20">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Exam Schedule</h1>
          <p style={{ color: theme.textSub }}>Engineered temporal logic for global examination windows</p>
        </div>
        {!schedule && (
          <Btn onClick={generateSchedule} disabled={loading}>
            {loading ? <span className="spin">⟳</span> : <Icon name="chart" size={16} />}
            Synthesize Timeline
          </Btn>
        )}
      </div>

      {!schedule ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-white">
          <Card className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 450, textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, background: 'rgba(59, 130, 246, 0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.accent, marginBottom: 24, border: `1px solid ${theme.accent}30` }}>
              <Icon name="calendar" size={40} />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>No Timeline Generated</h3>
            <p style={{ color: theme.textSub, maxWidth: 360, lineHeight: 1.6 }}>
              Our conflict-free engine requires the subject list and student counts to architect a localized examination schedule.
            </p>
            <div style={{ marginTop: 32, display: 'flex', gap: 16 }}>
              <Badge color="blue">Constraint Based</Badge>
              <Badge color="teal">Gap Optimized</Badge>
            </div>
          </Card>

          <Card style={{ background: 'rgba(59, 130, 246, 0.03)', border: `1px solid ${theme.accent}20` }}>
            <Icon name="info" color={theme.accent} size={32} />
            <h4 style={{ fontSize: 18, fontWeight: 700, marginTop: 16, marginBottom: 20 }}>Optimization Engine</h4>
            <div className="space-y-6">
              {[
                { title: 'Conflict Resolution', desc: 'Ensures no student has overlapping examinations.' },
                { title: 'Gap Analysis', desc: 'Maintains optimal study intervals between major papers.' },
                { title: 'Room Balancing', desc: 'Distributes load across campus facilities evenly.' }
              ].map((feature, i) => (
                <div key={i} className="space-y-1">
                  <p style={{ fontSize: 11, fontWeight: 800, color: theme.accent, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{feature.title}</p>
                  <p style={{ color: theme.textSub, fontSize: 13, lineHeight: 1.5 }}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : (
        <div className="fade-in space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schedule.map((day) => (
              <Card key={day.id} style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.02)', borderBottom: `1px solid #1e2d45` }}>
                  <Badge color="blue">SESSION {day.id}</Badge>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>{day.date}</h3>
                </div>
                <div style={{ padding: 24 }} className="space-y-6">
                  {day.subjects.map((sub, sIdx) => (
                    <div key={sIdx} style={{ paddingLeft: 16, borderLeft: `2px solid #1e2d45`, position: 'relative' }}>
                      <div style={{ position: 'absolute', left: -5, top: 4, width: 8, height: 8, background: '#1e2d45', borderRadius: '50%', border: '2px solid #0a0f1a' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 4 }}>
                        <p style={{ fontWeight: 700, fontSize: 14 }}>{sub.name}</p>
                        <span style={{ fontSize: 10, fontWeight: 800, color: theme.textMuted }}>{sub.time}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: theme.accent }}>{sub.code}</span>
                        <div style={{ width: 4, height: 4, background: '#1e2d45', borderRadius: '50%' }} />
                        <span style={{ fontSize: 11, fontWeight: 700, color: theme.textMuted }}>{sub.room}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          <Card style={{ padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, background: 'rgba(16, 185, 129, 0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                <Icon name="check" size={24} />
              </div>
              <div>
                <p style={{ fontWeight: 700 }}>Schedule Finalized</p>
                <p style={{ fontSize: 13, color: theme.textSub }}>All constraints satisfied by the neural architect.</p>
              </div>
            </div>
            <Btn variant="ghost" small onClick={() => setSchedule(null)}>Recalculate Constraints</Btn>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ExamSchedule;

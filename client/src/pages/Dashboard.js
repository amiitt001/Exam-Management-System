import React from "react";
import { Card, Icon, Badge } from "../components/ui/index";

const Dashboard = ({ papers = [], rooms = [], invigilators = [], exams = [] }) => {
  const stats = [
    { label: "Total Exams", value: exams.length || 0, icon: "calendar", color: "blue" },
    { label: "Papers Generated", value: papers.length || 0, icon: "paper", color: "purple" },
    { label: "Rooms Configured", value: rooms.length || 0, icon: "seat", color: "green" },
    { label: "Invigilators", value: invigilators.length || 0, icon: "user", color: "yellow" },
  ];

  const theme = {
    accent: "#3b82f6",
    accentSoft: "rgba(59,130,246,0.12)",
    purple: "#8b5cf6",
    purpleSoft: "rgba(139,92,246,0.12)",
    success: "#10b981",
    successSoft: "rgba(16,185,129,0.12)",
    warning: "#f59e0b",
    warningSoft: "rgba(245,158,11,0.12)",
    textSub: "#94a3b8",
    surfaceAlt: "#1a2235",
    textMuted: "#64748b",
    danger: "#ef4444"
  };

  const colorMap = { blue: theme.accent, purple: theme.purple, green: theme.success, yellow: theme.warning };
  const softMap = { blue: theme.accentSoft, purple: theme.purpleSoft, green: theme.successSoft, yellow: theme.warningSoft };

  const upcoming = exams.filter(e => e.status === "upcoming").slice(0, 3);
  const recent = papers.slice(-3).reverse();

  return (
    <div className="fade-in space-y-8">
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Dashboard</h1>
        <p style={{ color: theme.textSub }}>Overview of your examination management system</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: softMap[s.color], display: "flex", alignItems: "center", justifyContent: "center", color: colorMap[s.color], flexShrink: 0 }}>
              <Icon name={s.icon} size={22} />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: colorMap[s.color] }}>{s.value}</div>
              <div style={{ fontSize: 13, color: theme.textSub, whiteSpace: 'nowrap' }}>{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Exams */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: 16 }}>Upcoming Exams</h3>
            <Badge color="blue">{upcoming.length} scheduled</Badge>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {upcoming.length === 0 && <p style={{ color: theme.textMuted, fontSize: 14, textAlign: 'center', padding: '20px' }}>No upcoming exams</p>}
            {upcoming.map(ex => (
              <div key={ex.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: theme.surfaceAlt, borderRadius: 10 }}>
                <div style={{ width: 42, height: 42, background: theme.accentSoft, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: theme.accent, flexShrink: 0 }}>
                  <Icon name="calendar" size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{ex.subject}</div>
                  <div style={{ fontSize: 12, color: theme.textSub }}>{ex.date} · {ex.time} · {ex.room}</div>
                </div>
                <Badge color="green">{ex.students} students</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Papers */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h3 style={{ fontWeight: 700, fontSize: 16 }}>Recent Papers</h3>
            <Badge color="purple">{papers.length} total</Badge>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {papers.length === 0 && <p style={{ color: theme.textMuted, fontSize: 14, textAlign: 'center', padding: '20px' }}>No papers generated yet</p>}
            {recent.map(p => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: theme.surfaceAlt, borderRadius: 10 }}>
                <div style={{ width: 42, height: 42, background: theme.purpleSoft, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: theme.purple, flexShrink: 0 }}>
                  <Icon name="paper" size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{p.subject}</div>
                  <div style={{ fontSize: 12, color: theme.textSub }}>{p.topic} · {p.totalMarks} marks</div>
                </div>
                <Badge color={p.difficulty === "Hard" ? "red" : p.difficulty === "Easy" ? "green" : "yellow"}>{p.difficulty}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Room Utilization */}
      <Card>
        <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Room Utilization</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {rooms.slice(0, 5).map(r => {
            const pct = Math.round((r.allocated / r.capacity) * 100);
            const barColor = pct >= 90 ? theme.danger : pct >= 70 ? theme.warning : theme.success;
            return (
              <div key={r.id}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{r.name}</span>
                  <span style={{ fontSize: 13, color: theme.textSub }}>{r.allocated}/{r.capacity} students ({pct}%)</span>
                </div>
                <div style={{ height: 8, background: theme.surfaceAlt, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 4, transition: "width 0.5s" }} />
                </div>
              </div>
            );
          })}
          {rooms.length === 0 && <p style={{ color: theme.textMuted, fontSize: 14, textAlign: 'center' }}>No rooms configured</p>}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;

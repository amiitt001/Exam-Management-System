import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon } from '../ui';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/generate-paper', label: 'Paper Gen', icon: 'paper' },
    { path: '/seating', label: 'Seating', icon: 'seat' },
    { path: '/invigilator', label: 'Invigilation', icon: 'user' },
    { path: '/schedule', label: 'Schedule', icon: 'calendar' },
  ];

  const theme = {
    surface: "#111827",
    border: "#1e2d45",
    accent: "#3b82f6",
    accentSoft: "rgba(59,130,246,0.12)",
    text: "#f1f5f9",
    textSub: "#94a3b8",
    textMuted: "#64748b",
  };

  return (
    <aside style={{
      width: isOpen ? 240 : 68,
      background: theme.surface,
      borderRight: `1px solid ${theme.border}`,
      display: "flex", flexDirection: "column",
      transition: "width 0.25s ease",
      flexShrink: 0, overflow: "hidden",
      height: "100%",
    }}>
      {/* Logo */}
      <div style={{
        padding: "20px 16px", borderBottom: `1px solid ${theme.border}`,
        display: "flex", alignItems: "center", gap: 10, height: 64,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: theme.accent,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Icon name="star" size={18} color="#fff" />
        </div>
        {isOpen && (
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 15, whiteSpace: "nowrap" }}>ExamMS</div>
            <div style={{ fontSize: 11, color: theme.textMuted, whiteSpace: "nowrap" }}>Management System</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 8px", overflow: "hidden auto" }}>
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 12px", borderRadius: 10, cursor: "pointer",
              marginBottom: 2, transition: "all 0.15s",
              background: isActive ? theme.accentSoft : "transparent",
              color: isActive ? theme.accent : theme.textSub,
              whiteSpace: "nowrap",
              textDecoration: "none",
            })}
          >
            <div style={{ flexShrink: 0 }}>
              <Icon name={item.icon} size={19} />
            </div>
            {isOpen && <span style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Toggle */}
      <div style={{ padding: "12px 8px", borderTop: `1px solid ${theme.border}` }}>
        <div onClick={() => setIsOpen(!isOpen)} style={{
          display: "flex", alignItems: "center", justifyContent: isOpen ? "flex-end" : "center",
          padding: "8px 12px", cursor: "pointer", color: theme.textMuted, borderRadius: 8,
        }}>
          <Icon name={isOpen ? "close" : "menu"} size={18} />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

import React from 'react';

const theme = {
    accent: "#3b82f6",
    accentSoft: "rgba(59,130,246,0.12)",
    success: "#10b981",
    successSoft: "rgba(16,185,129,0.12)",
    warning: "#f59e0b",
    warningSoft: "rgba(245,158,11,0.12)",
    danger: "#ef4444",
    dangerSoft: "rgba(239,68,68,0.12)",
    purple: "#8b5cf6",
    purpleSoft: "rgba(139,92,246,0.12)",
};

const Badge = ({ children, color = "blue" }) => {
    const map = {
        blue: [theme.accentSoft, theme.accent],
        green: [theme.successSoft, theme.success],
        yellow: [theme.warningSoft, theme.warning],
        red: [theme.dangerSoft, theme.danger],
        purple: [theme.purpleSoft, theme.purple]
    };
    const [bg, fg] = map[color] || map.blue;
    return (
        <span className="tag" style={{ background: bg, color: fg }}>
            {children}
        </span>
    );
};

export default Badge;

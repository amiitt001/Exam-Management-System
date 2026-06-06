import React from 'react';

const theme = {
    accent: "var(--accent-blue)",
    accentSoft: "var(--accent-blue-soft, rgba(59,130,246,0.12))",
    success: "var(--accent-teal)",
    successSoft: "var(--accent-teal-soft, rgba(16,185,129,0.12))",
    warning: "var(--accent-gold)",
    warningSoft: "var(--accent-gold-soft, rgba(245,158,11,0.12))",
    danger: "var(--accent-rose)",
    dangerSoft: "var(--accent-rose-soft, rgba(239,68,68,0.12))",
    purple: "var(--accent-purple)",
    purpleSoft: "var(--accent-purple-soft, rgba(139,92,246,0.12))",
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

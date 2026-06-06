import React from 'react';

const theme = {
    accent: "var(--accent-blue)",
    success: "var(--accent-teal)",
    successSoft: "var(--accent-teal-soft, rgba(16,185,129,0.12))",
    danger: "var(--accent-rose)",
    dangerSoft: "var(--accent-rose-soft, rgba(239,68,68,0.12))",
    textSub: "var(--text-secondary)",
    border: "var(--border-subtle)",
};

const Btn = ({ children, variant = "primary", onClick, disabled, style = {}, small }) => {
    const variants = {
        primary: { bg: theme.accent, color: "#fff", border: "none" },
        ghost: { bg: "transparent", color: theme.textSub, border: `1px solid ${theme.border}` },
        danger: { bg: theme.dangerSoft, color: theme.danger, border: `1px solid ${theme.danger}30` },
        success: { bg: theme.successSoft, color: theme.success, border: `1px solid ${theme.success}30` },
    };
    const v = variants[variant];
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: small ? "6px 14px" : "10px 20px",
                borderRadius: 10,
                fontSize: small ? 13 : 14,
                fontWeight: 500,
                background: v.bg,
                color: v.color,
                border: v.border,
                opacity: disabled ? 0.5 : 1,
                transition: "all 0.2s",
                whiteSpace: "nowrap",
                ...style,
            }}
            onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = "0.85"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
        >
            {children}
        </button>
    );
};

export default Btn;

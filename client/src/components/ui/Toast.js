import React from 'react';
import Icon from './Icon';

const theme = {
    surface: "#111827",
    success: "#10b981",
    danger: "#ef4444",
    text: "#f1f5f9",
};

const Toast = ({ msg, type = "success" }) => {
    const color = type === "success" ? theme.success : theme.danger;
    return (
        <div className="fade-in" style={{
            position: "fixed", bottom: 24, right: 24, zIndex: 2000,
            background: theme.surface, border: `1px solid ${color}40`,
            borderLeft: `3px solid ${color}`, borderRadius: 10,
            padding: "14px 20px", display: "flex", alignItems: "center", gap: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}>
            <Icon name={type === "success" ? "check" : "x"} size={16} color={color} />
            <span style={{ fontSize: 14, color: theme.text }}>{msg}</span>
        </div>
    );
};

export default Toast;

import React from 'react';
import Icon from './Icon';

const theme = {
    surface: "var(--bg-surface)",
    border: "var(--border-subtle)",
    textMuted: "var(--text-muted)",
};

const Modal = ({ title, onClose, children, width = 520 }) => (
    <div style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex",
        alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16,
    }} onClick={onClose}>
        <div className="fade-in" style={{
            background: theme.surface, border: `1px solid ${theme.border}`,
            borderRadius: 20, width: "100%", maxWidth: width, maxHeight: "90vh", overflow: "auto",
        }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: `1px solid ${theme.border}` }}>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h3>
                <button onClick={onClose} style={{ background: "none", border: "none", color: theme.textMuted }}><Icon name="x" size={20} /></button>
            </div>
            <div style={{ padding: 24 }}>{children}</div>
        </div>
    </div>
);

export default Modal;

import React from 'react';

const theme = {
    surfaceAlt: "var(--bg-surface-alt)",
    border: "var(--border-subtle)",
    text: "var(--text-primary)",
    textSub: "var(--text-secondary)",
};

const Input = ({ label, value, onChange, placeholder, type = "text", options, rows }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {label && <label style={{ fontSize: 13, color: theme.textSub, fontWeight: 500 }}>{label}</label>}
        {options ? (
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                style={{
                    background: theme.surfaceAlt, border: `1px solid ${theme.border}`,
                    borderRadius: 8, padding: "10px 14px", color: theme.text, fontSize: 14, width: "100%",
                }}
            >
                {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
            </select>
        ) : rows ? (
            <textarea
                value={value} onChange={e => onChange(e.target.value)}
                placeholder={placeholder} rows={rows}
                style={{
                    background: theme.surfaceAlt, border: `1px solid ${theme.border}`,
                    borderRadius: 8, padding: "10px 14px", color: theme.text, fontSize: 14, width: "100%", resize: "vertical",
                }}
            />
        ) : (
            <input
                type={type} value={value} onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                style={{
                    background: theme.surfaceAlt, border: `1px solid ${theme.border}`,
                    borderRadius: 8, padding: "10px 14px", color: theme.text, fontSize: 14, width: "100%",
                }}
            />
        )}
    </div>
);

export default Input;

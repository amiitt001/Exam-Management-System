import React from 'react';

const theme = {
    surface: "var(--bg-surface)",
    border: "var(--border-subtle)",
};

const Card = ({ children, style = {} }) => (
    <div style={{
        background: theme.surface, border: `1px solid ${theme.border}`,
        borderRadius: 16, padding: 24, ...style,
    }}>
        {children}
    </div>
);

export default Card;

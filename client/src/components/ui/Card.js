import React from 'react';

const theme = {
    surface: "#111827",
    border: "#1e2d45",
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

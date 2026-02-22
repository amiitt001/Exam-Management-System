import React from 'react';
import { Card, Icon } from '../ui';

const AboutUs = () => {
    const theme = {
        accent: "#3b82f6",
        textSub: "#94a3b8",
    };

    return (
        <div className="fade-in pt-12 pb-20">
            <div className="max-w-4xl mx-auto">
                <Card style={{ padding: '60px 40px', md: { padding: '80px 60px' } }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <Badge color="blue" style={{ marginBottom: 24 }}>OUR STORY</Badge>
                        <h1 style={{ fontSize: 42, lineHeight: 1.1, fontWeight: 800, color: '#fff', marginBottom: 32 }}>
                            Intelligent Logistics for <br />
                            <span style={{ color: theme.accent }}>Modern Education.</span>
                        </h1>

                        <div style={{ color: theme.textSub, fontSize: 18, lineHeight: 1.8, maxWidth: 640 }}>
                            <p style={{ marginBottom: 24 }}>
                                ExamGen was born from a simple observation: <strong style={{ color: '#fff' }}>Academic logistics are unnecessarily hard.</strong>
                                Institutions spend hundreds of hours manually arranging seats, creating papers, and assigning duties — time that is better spent on student success.
                            </p>

                            <p style={{ marginBottom: 40 }}>
                                We are a team of educators and developers building the "operating system" for examinations.
                                Our platform handles the massive complexity of modern educational constraints using high-precision AI and automated logic.
                            </p>

                            <div style={{ width: 80, height: 1, background: 'rgba(255,255,255,0.1)', margin: '0 auto 40px' }} />

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Icon name="chart" color={theme.accent} size={32} />
                                <h3 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginTop: 16, marginBottom: 12 }}>Our Mission</h3>
                                <p style={{ fontSize: 16 }}>
                                    To eliminate administrative overhead in education through intelligent automation,
                                    ensuring fair, secure, and stress-free examinations for everyone.
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AboutUs;

const Badge = ({ children, color = "blue", style = {} }) => {
    const colors = {
        blue: { bg: "rgba(59,130,246,0.1)", text: "#3b82f6", border: "rgba(59,130,246,0.2)" },
    };
    const c = colors[color] || colors.blue;
    return (
        <span style={{
            padding: "4px 12px", borderRadius: 100, fontSize: 10, fontWeight: 800,
            background: c.bg, color: c.text, border: `1px solid ${c.border}`,
            letterSpacing: "1px", textTransform: "uppercase", ...style
        }}>
            {children}
        </span>
    );
};

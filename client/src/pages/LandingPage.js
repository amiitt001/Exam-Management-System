import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Icon, Btn } from "../components/ui/index";

const LandingPage = () => {
    const theme = {
        accent: "var(--accent-blue)",
        textSub: "var(--text-secondary)",
        surfaceAlt: "var(--bg-surface-alt)",
        border: "var(--border-subtle)",
    };

    return (
        <div className="fade-in min-h-screen">
            {/* Ambient Background Elements */}
            <div className="orb" style={{ top: '10%', left: '5%', width: 400, height: 400, opacity: 0.15 }} />
            <div className="orb" style={{ top: '60%', right: '5%', width: 500, height: 500, opacity: 0.1, background: 'var(--accent-teal)' }} />
            <div className="bg-grid opacity-20" />

            {/* Hero Section */}
            <header className="relative pt-32 pb-40 px-6 text-center overflow-hidden">
                <div className="max-w-5xl mx-auto relative z-10">
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 100, background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: theme.accent, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 32 }}>
                        <span className="pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: theme.accent }} />
                        AI Powered Exam Generation
                    </div>

                    <h1 style={{ fontSize: 'clamp(44px, 8vw, 84px)', lineHeight: 1, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 32, letterSpacing: '-0.03em' }}>
                        The Future of <br />
                        <span style={{
                            background: 'linear-gradient(to right, #3b82f6, #2dd4bf)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>Exam Management.</span>
                    </h1>

                    <p style={{ color: theme.textSub, fontSize: 'clamp(18px, 2vw, 22px)', lineHeight: 1.6, maxWidth: 640, margin: '0 auto 48px', fontWeight: 400 }}>
                        Automate seating plans, generate complex papers with Gemini AI, and manage invigilation in a seamless, secure cloud environment.
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20 }}>
                        <Link to="/dashboard">
                            <Btn style={{ padding: '20px 48px', fontSize: 18 }}>Launch Console</Btn>
                        </Link>
                        <Link to="/about">
                            <Btn variant="ghost" style={{ padding: '20px 48px', fontSize: 18 }}>Explore Features</Btn>
                        </Link>
                    </div>

                    <div style={{ marginTop: 80, display: 'flex', justifyContent: 'center', gap: 60 }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 32, fontWeight: 800, color: theme.accent }}>99%</div>
                            <div style={{ fontSize: 10, fontWeight: 800, color: theme.textSub, textTransform: 'uppercase', letterSpacing: 1 }}>Accuracy</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 32, fontWeight: 800, color: '#2dd4bf' }}>AI</div>
                            <div style={{ fontSize: 10, fontWeight: 800, color: theme.textSub, textTransform: 'uppercase', letterSpacing: 1 }}>Powered</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}>∞</div>
                            <div style={{ fontSize: 10, fontWeight: 800, color: theme.textSub, textTransform: 'uppercase', letterSpacing: 1 }}>Efficiency</div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Features Grid */}
            <section className="px-6 py-32 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div style={{ display: 'flex', flexDirection: 'column', md: { flexDirection: 'row' }, justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 80, gap: 32 }}>
                        <div>
                            <span style={{ color: theme.accent, fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16, display: 'block' }}>Core Platform</span>
                            <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>Everything you need to <br />run exams like clockwork.</h2>
                        </div>
                        <p style={{ color: theme.textSub, fontSize: 18, maxWidth: 440 }}>
                            A unified suite of tools designed to replace manual processes with high-precision AI automation.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <FeatureCard
                            icon="user"
                            title="Smart Seating"
                            desc="Generate conflict-free seating plans with support for Staggered, Columnar, and Snake patterns."
                            color="blue"
                        />
                        <FeatureCard
                            icon="chart"
                            title="Paper Gen"
                            desc="Leverages Gemini AI to build balanced question papers from your bank with custom difficulty."
                            color="teal"
                        />
                        <FeatureCard
                            icon="user"
                            title="Invigilation"
                            desc="Fairly allocate duties to faculty members, tracking hours and preventing scheduling collisions."
                            color="cyan"
                        />
                        <FeatureCard
                            icon="calendar"
                            title="Scheduling"
                            desc="Advanced time-tabling that flags room conflicts and resource bottlenecks automatically."
                            color="amber"
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '80px 24px', borderTop: `1px solid ${theme.border}`, background: 'rgba(0,0,0,0.02)' }}>
                <div className="max-w-7xl mx-auto" style={{ display: 'flex', flexDirection: 'column', md: { flexDirection: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 40 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, background: theme.accent, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#000', fontSize: 20 }}>E</div>
                        <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>ExamGen</span>
                    </div>
                    <p style={{ color: theme.textSub, fontSize: 14 }}>
                        &copy; 2026 ExamGen Inc. Built with AI for modern education.
                    </p>
                    <div style={{ display: 'flex', gap: 32, fontSize: 14, fontWeight: 600 }}>
                        <Link to="/about" style={{ color: theme.textSub }}>Privacy</Link>
                        <Link to="/contact" style={{ color: theme.textSub }}>Terms</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc, color }) => (
    <Card hover style={{ padding: 40 }}>
        <div style={{ width: 64, height: 64, background: 'var(--bg-surface-alt)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32, border: '1px solid var(--border-subtle)' }}>
            <Icon name={icon} size={32} color={color === 'blue' ? '#3b82f6' : '#2dd4bf'} />
        </div>
        <h3 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>{title}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{desc}</p>
    </Card>
);

export default LandingPage;

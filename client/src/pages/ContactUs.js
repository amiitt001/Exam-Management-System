import React, { useState } from 'react';
import { Card, Icon, Btn, Input } from "../components/ui/index";

const ContactUs = () => {
    const theme = {
        accent: "var(--accent-blue)",
        textSub: "var(--text-secondary)",
        surfaceAlt: "var(--bg-surface-alt)",
    };

    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', message: '' });
    const f = (k) => (v) => setForm(prev => ({ ...prev, [k]: v }));

    return (
        <div className="fade-in pt-12 pb-20">
            <div className="max-w-6xl mx-auto">
                <div style={{ textAlign: 'center', marginBottom: 60 }}>
                    <Badge color="blue" style={{ marginBottom: 16 }}>GET SUPPORT</Badge>
                    <h1 style={{ fontSize: 48, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>
                        Let's start a conversation.
                    </h1>
                    <p style={{ color: theme.textSub, fontSize: 18, max_width: 600, margin: '0 auto' }}>
                        Have questions about our AI-powered features or enterprise deployments? We'd love to hear from you.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
                    {/* Contact Info */}
                    <div className="md:col-span-2 space-y-6">
                        <Card hover style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                            <div style={{ width: 48, height: 48, background: 'rgba(59, 130, 246, 0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.accent }}>
                                <Icon name="check" size={24} />
                            </div>
                            <div>
                                <h3 style={{ fontWeight: 700, fontSize: 18 }}>Email Us</h3>
                                <p style={{ color: theme.textSub, fontSize: 14 }}>support@examgen.com</p>
                            </div>
                        </Card>

                        <Card hover style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                            <div style={{ width: 48, height: 48, background: 'rgba(59, 130, 246, 0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.accent }}>
                                <Icon name="chart" size={24} />
                            </div>
                            <div>
                                <h3 style={{ fontWeight: 700, fontSize: 18 }}>Call Us</h3>
                                <p style={{ color: theme.textSub, fontSize: 14 }}>+1 (555) 123-4567</p>
                            </div>
                        </Card>

                        <Card hover style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                            <div style={{ width: 48, height: 48, background: 'rgba(59, 130, 246, 0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.accent }}>
                                <Icon name="user" size={24} />
                            </div>
                            <div>
                                <h3 style={{ fontWeight: 700, fontSize: 18 }}>Headquarters</h3>
                                <p style={{ color: theme.textSub, fontSize: 14, lineHeight: 1.5 }}>
                                    123 Tech Park Ave, Suite 400<br />
                                    Innovation District, SF, CA
                                </p>
                            </div>
                        </Card>
                    </div>

                    {/* Contact Form */}
                    <Card style={{ md: { gridColumn: 'span 3' } }} className="md:col-span-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                            <Input label="First Name" placeholder="John" value={form.firstName} onChange={f('firstName')} />
                            <Input label="Last Name" placeholder="Doe" value={form.lastName} onChange={f('lastName')} />
                        </div>
                        <div className="mb-6">
                            <Input label="Email Address" type="email" placeholder="john@example.com" value={form.email} onChange={f('email')} />
                        </div>
                        <div className="mb-10">
                            <Input label="Message" rows={5} placeholder="How can we help?" value={form.message} onChange={f('message')} />
                        </div>
                        <Btn style={{ width: '100%', justifyContent: 'center', padding: '16px 0' }}>
                            Send Transmission
                            <Icon name="arrow-right" size={16} style={{ marginLeft: 8 }} />
                        </Btn>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;

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

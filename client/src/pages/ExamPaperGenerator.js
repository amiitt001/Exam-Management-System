import React, { useState } from "react";
import { Card, Icon, Input, Btn, Badge } from "../components/ui";

const ExamPaperGenerator = ({ showToast }) => {
    const [loading, setLoading] = useState(false);
    const [paper, setPaper] = useState(null);
    const [form, setForm] = useState({
        syllabus: "",
        difficulty: "Intermediate",
        format: "Objective (MCQs)",
        count: 10
    });

    const f = (k) => (v) => setForm(prev => ({ ...prev, [k]: v }));

    const generatePaper = async () => {
        if (!form.syllabus) {
            if (showToast) showToast("Please enter syllabus topics", "error");
            return;
        }
        setLoading(true);

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/generate-paper`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    syllabus: form.syllabus,
                    difficulty: form.difficulty,
                    format: form.format,
                    numQuestions: form.count
                })
            });

            const data = await response.json();
            setPaper(data);
            if (showToast) showToast("Exam paper generated successfully!");
        } catch (error) {
            console.error("Generation failed", error);
            if (showToast) showToast("Generation failed", "error");
        }
        setLoading(false);
    };

    const downloadPDF = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/generate-paper-pdf`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ questions: paper.questions })
            });

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "ExamPaper.pdf";
            link.click();
            if (showToast) showToast("Downloaded as PDF!");
        } catch (error) {
            console.error("Download failed", error);
            if (showToast) showToast("Download failed", "error");
        }
    };

    const theme = {
        textSub: "#94a3b8",
        purple: "#8b5cf6",
        surfaceAlt: "#1a2235",
        textMuted: "#64748b",
        accent: "#3b82f6"
    };

    return (
        <div className="fade-in space-y-8 pb-20">
            <div>
                <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Paper Generator</h1>
                <p style={{ color: theme.textSub }}>Generate AI-powered exam question papers using Gemini-1.5-Pro</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* CONFIGURATION PANEL */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <h3 style={{ fontWeight: 700, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                            <Icon name="brain" size={18} color={theme.purple} /> Configure Synthesis
                        </h3>
                        <div className="space-y-6">
                            <Input
                                label="Syllabus / Topics"
                                value={form.syllabus}
                                onChange={f("syllabus")}
                                placeholder="Enter topics, e.g. Quantum Mechanics, Wave functions..."
                                rows={5}
                            />

                            <Input
                                label="Difficulty Level"
                                value={form.difficulty}
                                onChange={f("difficulty")}
                                options={["Beginner", "Intermediate", "Expert"]}
                            />

                            <Input
                                label="Question Format"
                                value={form.format}
                                onChange={f("format")}
                                options={["Objective (MCQs)", "Subjective (Theory)", "Hybrid Matrix"]}
                            />

                            <Input
                                label="Quantity"
                                type="number"
                                value={form.count}
                                onChange={v => f("count")(Number(v))}
                            />

                            <Btn
                                onClick={generatePaper}
                                disabled={loading}
                                style={{ width: "100%", justifyContent: "center" }}
                            >
                                {loading ? (
                                    <><span className="spin" style={{ display: "inline-block" }}>⟳</span> Synthesizing...</>
                                ) : (
                                    <>
                                        Synthesize Paper
                                        <Icon name="brain" size={16} />
                                    </>
                                )}
                            </Btn>
                        </div>
                    </Card>

                    <div style={{ background: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.1)", borderRadius: 16, padding: 20, display: "flex", gap: 12 }}>
                        <Icon name="info" color={theme.accent} size={20} />
                        <p style={{ fontSize: 12, color: theme.textSub, lineHeight: 1.6 }}>
                            AI synthesis can take up to 30 seconds depending on complexity. Gemini-1.5-Pro is active.
                        </p>
                    </div>
                </div>

                {/* PREVIEW + EDIT PANEL */}
                <div className="lg:col-span-2">
                    {!paper ? (
                        <Card style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 500, color: theme.textMuted, gap: 12, textAlign: 'center' }}>
                            <Icon name="paper" size={40} />
                            <h3 style={{ fontWeight: 700, color: '#fff' }}>No Synthesis Active</h3>
                            <p style={{ maxWidth: 280 }}>Configure the parameters on the left and trigger the neural engine to generate questions.</p>
                        </Card>
                    ) : (
                        <Card style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ padding: "20px 24px", borderBottom: `1px solid #1e2d45`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontWeight: 700, fontSize: 17 }}>Neural Preview</h3>
                                <Btn small variant="ghost" onClick={() => setPaper(null)}>Discard</Btn>
                            </div>

                            <div style={{ padding: 24, spaceY: 6, maxHeight: 600, overflow: 'auto' }} className="space-y-4">
                                {paper.questions.map((q, i) => (
                                    <div key={i} style={{ padding: 20, background: theme.surfaceAlt, borderRadius: 16, border: '1px solid #1e2d45' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                            <Badge color="blue">Component {i + 1}</Badge>
                                            <span style={{ fontSize: 11, color: theme.textMuted, fontWeight: 700, textTransform: 'uppercase', tracking: '1px' }}>Gemini-Refined</span>
                                        </div>
                                        <textarea
                                            style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', fontSize: 15, lineHeight: 1.6, resize: 'none', outline: 'none' }}
                                            rows={2}
                                            value={q.question}
                                            onChange={(e) => {
                                                const updated = [...paper.questions];
                                                updated[i].question = e.target.value;
                                                setPaper({ ...paper, questions: updated });
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div style={{ padding: 24, borderTop: `1px solid #1e2d45`, display: 'flex', gap: 12 }}>
                                <Btn
                                    variant="ghost"
                                    onClick={() => {
                                        setPaper({ ...paper, saved: true });
                                        if (showToast) showToast("Neural State Saved");
                                    }}
                                    style={{ flex: 1, justifyContent: "center" }}
                                >
                                    <Icon name="check" size={16} />
                                    {paper.saved ? "Neural State Saved" : "Commit to Neural Bank"}
                                </Btn>
                                <Btn
                                    onClick={downloadPDF}
                                    disabled={!paper.saved}
                                    style={{ flex: 1, justifyContent: "center" }}
                                >
                                    <Icon name="download" size={16} />
                                    Architect PDF
                                </Btn>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExamPaperGenerator;

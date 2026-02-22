import React, { useState } from "react";
import { FiFileText, FiCpu, FiDownload, FiSave, FiAlertCircle, FiCheckCircle, FiZap } from "react-icons/fi";

const ExamPaperGenerator = () => {
    const [loading, setLoading] = useState(false);
    const [paper, setPaper] = useState(null);

    const generatePaper = async () => {
        setLoading(true);

        const syllabus = document.getElementById("syllabus").value;
        const difficulty = document.getElementById("difficulty").value;
        const format = document.getElementById("format").value;
        const count = document.getElementById("count").value;

        // Simulate API call for UI demonstration if needed, but keeping actual logic
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL} /api/generate - paper`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ syllabus, difficulty, format, numQuestions: count })
            });

            const data = await response.json();
            setPaper(data);
        } catch (error) {
            console.error("Generation failed", error);
        }
        setLoading(false);
    };

    const downloadPDF = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL} /api/generate - paper - pdf`, {
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
        } catch (error) {
            console.error("Download failed", error);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-20">

            {/* Header */}
            <div>
                <span className="text-teal-400 font-bold tracking-[0.2em] text-[10px] uppercase mb-2 block">AI Laboratory</span>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <h2 className="font-serif text-3xl font-bold text-white flex items-center gap-3">
                        <FiFileText className="text-teal-400" />
                        Paper Generator
                    </h2>
                    <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                        <FiCpu className="text-teal-400 animate-pulse" />
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Gemini-1.5-Pro Active</span>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">

                {/* CONFIGURATION PANEL */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-card backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-2xl">
                        <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Configuration</h3>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Syllabus / Topics</label>
                                <textarea
                                    id="syllabus"
                                    rows={5}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white text-sm placeholder-slate-600 focus:border-teal-500/50 outline-none transition-all resize-none"
                                    placeholder="Enter topics, e.g. Quantum Mechanics, Wave functions..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Difficulty Level</label>
                                <select id="difficulty" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-teal-500/50 outline-none appearance-none">
                                    <option className="bg-void">Beginner</option>
                                    <option className="bg-void" selected>Intermediate</option>
                                    <option className="bg-void">Expert</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Question Format</label>
                                <select id="format" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-teal-500/50 outline-none appearance-none">
                                    <option className="bg-void">Objective (MCQs)</option>
                                    <option className="bg-void">Subjective (Theory)</option>
                                    <option className="bg-void">Hybrid Matrix</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quantity</label>
                                <input
                                    id="count"
                                    type="number"
                                    defaultValue="10"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-teal-500/50 outline-none"
                                />
                            </div>

                            <button
                                onClick={generatePaper}
                                disabled={loading}
                                className="w-full bg-gradient-to-br from-teal-400 to-cyan-500 text-slate-950 font-black py-4 rounded-2xl hover:shadow-[0_0_30px_rgba(0,229,195,0.4)] transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 group"
                            >
                                {loading ? (
                                    <span className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></span>
                                ) : (
                                    <>
                                        Synthesize Paper
                                        <FiZap className="group-hover:animate-bounce" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="bg-teal-500/5 border border-teal-500/10 rounded-2xl p-6 flex gap-4">
                        <FiAlertCircle className="text-teal-400 shrink-0" size={20} />
                        <p className="text-[11px] text-slate-400 leading-relaxed uppercase tracking-wider font-bold">
                            AI synthesis can take up to 30 seconds depending on complexity.
                        </p>
                    </div>
                </div>

                {/* PREVIEW + EDIT PANEL */}
                <div className="lg:col-span-2">
                    {!paper ? (
                        <div className="h-full min-h-[500px] border-2 border-dashed border-white/5 rounded-[40px] flex flex-col items-center justify-center text-center p-12">
                            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center text-slate-700 mb-6">
                                <FiFileText size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No Synthesis Active</h3>
                            <p className="text-slate-500 max-w-xs font-light">Configure the parameters on the left and trigger the neural engine to generate questions.</p>
                        </div>
                    ) : (
                        <div className="bg-card backdrop-blur-xl border border-white/10 rounded-[40px] shadow-2xl overflow-hidden animate-fade-up">
                            <div className="bg-white/5 px-10 py-6 border-b border-white/10 flex justify-between items-center">
                                <h3 className="font-serif text-xl font-bold text-white">Neural Preview</h3>
                                <div className="flex gap-4">
                                    <button onClick={() => setPaper(null)} className="text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">Discard</button>
                                </div>
                            </div>

                            <div className="p-10 space-y-8 max-h-[700px] overflow-y-auto custom-scrollbar">
                                {paper.questions.map((q, i) => (
                                    <div key={i} className="group space-y-3 p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-teal-500/30 transition-all">
                                        <div className="flex items-center justify-between text-[11px] font-black text-slate-600 uppercase tracking-[0.2em]">
                                            <span>Component {i + 1}</span>
                                            <span className="text-teal-500/50">Gemini-Refined</span>
                                        </div>
                                        <textarea
                                            className="w-full bg-transparent text-white text-lg font-light leading-relaxed border-none outline-none resize-none px-0"
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

                            <div className="bg-white/5 p-10 mt-auto border-t border-white/10 flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => setPaper({ ...paper, saved: true })}
                                    className="flex-1 bg-white/5 hover:bg-teal-500/10 text-white font-bold py-4 rounded-2xl border border-white/10 hover:border-teal-500/30 transition-all flex items-center justify-center gap-3"
                                >
                                    <FiSave className="text-teal-400" />
                                    {paper.saved ? "Neural State Saved" : "Commit to Neural Bank"}
                                </button>

                                <button
                                    onClick={downloadPDF}
                                    disabled={!paper.saved}
                                    className={`flex - 1 font - bold py - 4 rounded - 2xl transition - all flex items - center justify - center gap - 3 
                                        ${paper.saved
                                            ? 'bg-gradient-to-br from-teal-400 to-cyan-500 text-slate-950 hover:shadow-[0_0_30px_rgba(0,229,195,0.4)]'
                                            : 'bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed'
                                        } `}
                                >
                                    <FiDownload />
                                    Architect PDF
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExamPaperGenerator;

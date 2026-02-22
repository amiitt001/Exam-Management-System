import React from 'react';
import { Link } from 'react-router-dom';
import { FiLayout, FiFileText, FiUsers, FiClock } from 'react-icons/fi';

const LandingPage = () => {
    return (
        <div className="min-h-screen text-slate-200">

            {/* Hero Section */}
            <header className="relative pt-32 pb-40 px-6 text-center overflow-hidden">
                <div className="max-w-5xl mx-auto relative z-10">
                    <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-400 text-xs font-bold tracking-widest uppercase mb-8 animate-fade-in">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                        AI Powered Exam Generation
                    </div>

                    <h1 className="font-serif text-6xl md:text-8xl font-black tracking-tight text-white mb-8 leading-[1.1]">
                        The Future of <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-cyan-400 to-gold-400">Exam Management.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
                        Automate seating plans, generate complex paper with Gemini AI, and manage invigilation in a seamless, secure cloud environment.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-6 animate-fade-up">
                        <Link to="/dashboard">
                            <button className="bg-gradient-to-br from-teal-400 to-cyan-500 text-slate-950 px-10 py-5 rounded-2xl font-black text-xl hover:shadow-[0_0_50px_rgba(0,229,195,0.4)] transition-all transform hover:-translate-y-1 w-full sm:w-auto">
                                Launch Console →
                            </button>
                        </Link>
                        <Link to="/about">
                            <button className="bg-white/5 backdrop-blur-md border border-white/10 text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-white/10 transition-all w-full sm:w-auto">
                                Explore Features
                            </button>
                        </Link>
                    </div>

                    <div className="mt-20 flex justify-center gap-12 text-slate-500">
                        <div className="text-center">
                            <div className="text-3xl font-serif font-bold text-teal-400">99%</div>
                            <div className="text-[10px] tracking-widest uppercase font-bold mt-1">Accuracy</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-serif font-bold text-cyan-400">AI</div>
                            <div className="text-[10px] tracking-widest uppercase font-bold mt-1">Powered</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-serif font-bold text-white">∞</div>
                            <div className="text-[10px] tracking-widest uppercase font-bold mt-1">Efficiency</div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Features Grid */}
            <section className="px-6 py-32 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
                        <div>
                            <span className="text-teal-400 font-bold tracking-[0.2em] text-xs uppercase mb-4 block">Core Platform</span>
                            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white leading-tight">Everything you need to <br />run exams like clockwork.</h2>
                        </div>
                        <p className="text-slate-400 max-w-md text-lg leading-relaxed">
                            A unified suite of tools designed to replace manual processes with high-precision AI automation.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Feature 1 */}
                        <div className="group bg-white/5 backdrop-blur-sm p-10 rounded-[32px] border border-white/5 hover:border-teal-500/30 hover:bg-white/[0.08] transition-all duration-500 cursor-pointer">
                            <div className="w-16 h-16 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-400 mb-8 border border-teal-500/20 group-hover:scale-110 transition-transform">
                                <FiLayout size={32} />
                            </div>
                            <h3 className="font-serif text-2xl font-bold text-white mb-4">Smart Seating</h3>
                            <p className="text-slate-400 leading-relaxed text-sm">
                                Generate conflict-free seating plans with support for Staggered, Columnar, and Snake patterns.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="group bg-white/5 backdrop-blur-sm p-10 rounded-[32px] border border-white/5 hover:border-cyan-500/30 hover:bg-white/[0.08] transition-all duration-500 cursor-pointer">
                            <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400 mb-8 border border-cyan-500/20 group-hover:scale-110 transition-transform">
                                <FiFileText size={32} />
                            </div>
                            <h3 className="font-serif text-2xl font-bold text-white mb-4">Paper Gen</h3>
                            <p className="text-slate-400 leading-relaxed text-sm">
                                Leverages Gemini AI to build balanced question papers from your bank with custom difficulty.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="group bg-white/5 backdrop-blur-sm p-10 rounded-[32px] border border-white/5 hover:border-white/20 hover:bg-white/[0.08] transition-all duration-500 cursor-pointer">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white mb-8 border border-white/10 group-hover:scale-110 transition-transform">
                                <FiUsers size={32} />
                            </div>
                            <h3 className="font-serif text-2xl font-bold text-white mb-4">Invigilation</h3>
                            <p className="text-slate-400 leading-relaxed text-sm">
                                Fairly allocate duties to faculty members, tracking hours and preventing scheduling collisions.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="group bg-white/5 backdrop-blur-sm p-10 rounded-[32px] border border-white/5 hover:border-amber-500/30 hover:bg-white/[0.08] transition-all duration-500 cursor-pointer">
                            <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-400 mb-8 border border-amber-500/20 group-hover:scale-110 transition-transform">
                                <FiClock size={32} />
                            </div>
                            <h3 className="font-serif text-2xl font-bold text-white mb-4">Scheduling</h3>
                            <p className="text-slate-400 leading-relaxed text-sm">
                                Advanced time-tabling that flags room conflicts and resource bottlenecks automatically.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 py-16 px-6 relative z-10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-teal-500 rounded flex items-center justify-center font-serif font-black text-slate-900 text-sm">E</div>
                        <span className="text-xl font-serif font-bold text-white">ExamGen</span>
                    </div>
                    <p className="text-slate-500 text-sm tracking-wide">
                        &copy; 2026 ExamGen Inc. Built with AI for modern education.
                    </p>
                    <div className="flex gap-8 text-slate-400 text-sm font-medium">
                        <Link to="/about" className="hover:text-teal-400 transition-colors">Privacy</Link>
                        <Link to="/contact" className="hover:text-teal-400 transition-colors">Terms</Link>
                    </div>
                </div>
            </footer>

        </div>
    );
};

export default LandingPage;

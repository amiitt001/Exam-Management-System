import React from 'react';
import { Link } from 'react-router-dom';
import { FiLayout, FiFileText, FiUsers, FiClock } from 'react-icons/fi';

const LandingPage = () => {
    return (
        <div className="pt-16 min-h-screen bg-gray-50 font-sans text-gray-900">

            {/* Hero Section */}
            <header className="px-6 pt-20 pb-28 text-center bg-white">
                <div className="max-w-4xl mx-auto">
                    <span className="inline-block py-1 px-3 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold mb-6">
                        Version 2.0 Now Available
                    </span>
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-8 leading-tight">
                        The Ultimate <span className="text-indigo-600">Exam Management</span> Platform for Modern Institutions.
                    </h1>
                    <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Automate seating plans, generate complex exam papers, and allocate invigilators in seconds. secure, efficient, and error-free.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/dashboard">
                            <button className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition shadow-xl shadow-indigo-200 w-full sm:w-auto">
                                Get Started for Free
                            </button>
                        </Link>
                        <Link to="/about">
                            <button className="bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold text-lg hover:border-slate-300 hover:bg-slate-50 transition w-full sm:w-auto">
                                Learn More
                            </button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Features Grid */}
            <section className="px-6 py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need to run exams smoothly</h2>
                        <p className="text-gray-500">Powerful tools integrated into one seamless workflow.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-6">
                                <FiLayout size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Smart Seating</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Automatically generate conflict-free seating plans with support for Staggered, Columnar, and Snake patterns.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
                            <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600 mb-6">
                                <FiFileText size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Paper Generator</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Create balanced question papers from your question bank with customizable difficulty and topics.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
                            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 mb-6">
                                <FiUsers size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Invigilation</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Fairly allocate duties to faculty members, tracking hours and preventing collisions.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
                            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 mb-6">
                                <FiClock size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Scheduling</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Drag-and-drop exam scheduling that automatically flags room and resource conflicts.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <span className="text-2xl font-bold text-white">ExamGen</span>
                    <p className="text-slate-400">© 2025 ExamGen Inc. All rights reserved.</p>
                </div>
            </footer>

        </div>
    );
};

export default LandingPage;

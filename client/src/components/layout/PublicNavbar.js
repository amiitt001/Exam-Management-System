import React from 'react';
import { Link } from 'react-router-dom';

const PublicNavbar = () => {
    return (
        <nav className="w-full bg-void/75 backdrop-blur-xl border-b border-white/5 py-4 px-8 fixed top-0 left-0 z-[100] h-[72px] flex items-center">
            <div className="max-w-7xl mx-auto w-full flex justify-between items-center">

                {/* Logo Area */}
                <Link to="/" className="flex items-center gap-3 no-underline group">
                    <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center font-serif font-black text-slate-900 text-lg shadow-[0_0_20px_rgba(0,229,195,0.4)] group-hover:scale-105 transition-transform">
                        E
                    </div>
                    <span className="text-xl font-serif font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-400">
                        ExamGen
                    </span>
                </Link>

                {/* Nav Links */}
                <div className="hidden md:flex items-center gap-10">
                    <Link to="/" className="text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors no-underline">Home</Link>
                    <Link to="/about" className="text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors no-underline">About Us</Link>
                    <Link to="/contact" className="text-sm font-medium text-slate-400 hover:text-teal-400 transition-colors no-underline">Contact</Link>
                </div>

                {/* CTA Button */}
                <div className="flex items-center gap-4">
                    <button className="hidden sm:block text-sm font-semibold text-slate-400 hover:text-teal-400 transition-colors">
                        Sign In
                    </button>
                    <Link to="/dashboard">
                        <button className="bg-gradient-to-br from-teal-400 to-cyan-500 hover:shadow-[0_0_30px_rgba(0,229,195,0.4)] text-slate-950 px-6 py-2 rounded-full font-bold text-sm transition-all transform hover:-translate-y-0.5">
                            Launch App →
                        </button>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default PublicNavbar;

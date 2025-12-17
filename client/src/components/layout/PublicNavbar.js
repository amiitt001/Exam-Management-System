import React from 'react';
import { Link } from 'react-router-dom';

const PublicNavbar = () => {
    return (
        <nav className="w-full bg-white shadow-sm border-b border-gray-100 py-4 px-6 fixed top-0 left-0 z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center">

                {/* Logo Area */}
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                        ExamGen
                    </span>
                </div>

                {/* Nav Links */}
                <div className="hidden md:flex items-center gap-8">
                    <Link to="/" className="text-gray-600 hover:text-indigo-600 font-medium transition cursor-pointer no-underline">Home</Link>
                    <Link to="/about" className="text-gray-600 hover:text-indigo-600 font-medium transition cursor-pointer no-underline">About Us</Link>
                    <Link to="/contact" className="text-gray-600 hover:text-indigo-600 font-medium transition cursor-pointer no-underline">Contact</Link>
                </div>

                {/* CTA Button */}
                <div>
                    <Link to="/dashboard">
                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full font-medium transition shadow-lg shadow-indigo-200">
                            Go to Console
                        </button>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default PublicNavbar;

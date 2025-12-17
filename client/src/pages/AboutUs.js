import React from 'react';

const AboutUs = () => {
    return (
        <div className="pt-24 pb-20 px-6 min-h-screen bg-gray-50 font-sans">
            <div className="max-w-3xl mx-auto bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
                <h1 className="text-4xl font-extrabold text-slate-900 mb-8">About Us</h1>

                <div className="prose prose-lg text-gray-500">
                    <p className="mb-6">
                        ExamGen was born from a simple observation: <strong>Academic logistics are unnecessarily hard.</strong>
                        Teachers spend hours manually arranging seats, creating papers, and assigning duties—time that could be better spent teaching.
                    </p>

                    <p className="mb-6">
                        We are a team of educators and developers passionate about streamlining the exam process.
                        Our platform is designed to handle the complex constraints of modern educational institutions,
                        from multi-branch seating arrangements to randomized question paper generation.
                    </p>

                    <h3 className="text-2xl font-bold text-slate-900 mt-10 mb-4">Our Mission</h3>
                    <p className="mb-6">
                        To eliminate administrative overhead in education through intelligent automation,
                        ensuring fair, secure, and stress-free examinations for everyone.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;

import React from 'react';

const AboutUs = () => {
    return (
        <div className="pt-32 pb-20 px-6 min-h-screen text-slate-200 relative z-10">
            <div className="max-w-3xl mx-auto bg-white/5 backdrop-blur-xl p-10 md:p-16 rounded-[40px] border border-white/10 shadow-2xl">
                <span className="text-teal-400 font-bold tracking-[0.2em] text-xs uppercase mb-4 block">Our Story</span>
                <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-10">Intelligent Logistics <br />for Modern Education.</h1>

                <div className="space-y-6 text-slate-400 text-lg leading-relaxed font-light">
                    <p>
                        ExamGen was born from a simple observation: <strong className="text-white font-medium">Academic logistics are unnecessarily hard.</strong>
                        Institutions spend hundreds of hours manually arranging seats, creating papers, and assigning duties — time that is better spent on student success.
                    </p>

                    <p>
                        We are a team of educators and developers building the "operating system" for examinations.
                        Our platform handles the massive complexity of modern educational constraints using high-precision AI and automated logic.
                    </p>

                    <div className="h-px bg-white/10 my-10"></div>

                    <h3 className="font-serif text-2xl font-bold text-white mb-4">Our Mission</h3>
                    <p>
                        To eliminate administrative overhead in education through intelligent automation,
                        ensuring fair, secure, and stress-free examinations for everyone.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;

import React from 'react';
import { FiMail, FiMapPin, FiPhone } from 'react-icons/fi';

const ContactUs = () => {
    return (
        <div className="pt-32 pb-20 px-6 min-h-screen text-slate-200 relative z-10">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-20">
                    <span className="text-teal-400 font-bold tracking-[0.2em] text-xs uppercase mb-4 block">Get Support</span>
                    <h1 className="font-serif text-5xl md:text-6xl font-bold text-white mb-6">Let's start a conversation.</h1>
                    <p className="text-slate-400 text-xl max-w-2xl mx-auto font-light">Have questions about our AI-powered features or enterprise deployments? We'd love to hear from you.</p>
                </div>

                <div className="grid md:grid-cols-5 gap-8 items-start">
                    {/* Contact Info */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[32px] border border-white/10 hover:border-teal-500/30 transition-all group">
                            <div className="w-12 h-12 bg-teal-500/10 text-teal-400 rounded-xl flex items-center justify-center mb-6 border border-teal-500/20 group-hover:scale-110 transition-transform">
                                <FiMail size={24} />
                            </div>
                            <h3 className="font-serif text-xl font-bold text-white mb-1">Email Us</h3>
                            <p className="text-slate-400 font-light">support@examgen.com</p>
                        </div>

                        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[32px] border border-white/10 hover:border-cyan-500/30 transition-all group">
                            <div className="w-12 h-12 bg-cyan-500/10 text-cyan-400 rounded-xl flex items-center justify-center mb-6 border border-cyan-500/20 group-hover:scale-110 transition-transform">
                                <FiPhone size={24} />
                            </div>
                            <h3 className="font-serif text-xl font-bold text-white mb-1">Call Us</h3>
                            <p className="text-slate-400 font-light">+1 (555) 123-4567</p>
                        </div>

                        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[32px] border border-white/10 hover:border-white/30 transition-all group">
                            <div className="w-12 h-12 bg-white/5 text-white rounded-xl flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform">
                                <FiMapPin size={24} />
                            </div>
                            <h3 className="font-serif text-xl font-bold text-white mb-1">Headquarters</h3>
                            <p className="text-slate-400 font-light leading-relaxed">
                                123 Tech Park Ave, Suite 400<br />
                                Innovation District,<br />
                                San Francisco, CA 94105
                            </p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <form className="md:col-span-3 bg-white/5 backdrop-blur-xl p-10 md:p-12 rounded-[40px] border border-white/10 shadow-2xl">
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div className="space-y-2">
                                <label className="text-[10px] tracking-[0.2em] font-black text-slate-500 uppercase">First Name</label>
                                <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-slate-600 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 outline-none transition" placeholder="John" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] tracking-[0.2em] font-black text-slate-500 uppercase">Last Name</label>
                                <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-slate-600 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 outline-none transition" placeholder="Doe" />
                            </div>
                        </div>
                        <div className="space-y-2 mb-6">
                            <label className="text-[10px] tracking-[0.2em] font-black text-slate-500 uppercase">Email Address</label>
                            <input type="email" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-slate-600 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 outline-none transition" placeholder="john@example.com" />
                        </div>
                        <div className="space-y-2 mb-10">
                            <label className="text-[10px] tracking-[0.2em] font-black text-slate-500 uppercase">Message</label>
                            <textarea className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-slate-600 focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 outline-none transition h-40 resize-none" placeholder="How can we help?"></textarea>
                        </div>
                        <button type="button" className="w-full bg-gradient-to-br from-teal-400 to-cyan-500 text-slate-950 font-black py-5 rounded-2xl hover:shadow-[0_0_40px_rgba(0,229,195,0.4)] transition-all transform hover:-translate-y-1">
                            Send Transmission →
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;

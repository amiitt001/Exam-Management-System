import React from 'react';
import { FiMail, FiMapPin, FiPhone } from 'react-icons/fi';

const ContactUs = () => {
    return (
        <div className="pt-24 pb-20 px-6 min-h-screen bg-gray-50 font-sans">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Get in Touch</h1>
                    <p className="text-gray-500">Have questions? We'd love to hear from you.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-start gap-4 mb-8">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                                <FiMail size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">Email</h3>
                                <p className="text-gray-500">support@examgen.com</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 mb-8">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                                <FiPhone size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">Phone</h3>
                                <p className="text-gray-500">+1 (555) 123-4567</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                                <FiMapPin size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">Office</h3>
                                <p className="text-gray-500">
                                    123 Tech Park Ave,<br />
                                    Innovation District,<br />
                                    San Francisco, CA 94105
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <form className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                            <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition" placeholder="Your Name" />
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input type="email" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition" placeholder="you@company.com" />
                        </div>
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                            <textarea className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition h-32 resize-none" placeholder="How can we help?"></textarea>
                        </div>
                        <button type="button" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition">
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;

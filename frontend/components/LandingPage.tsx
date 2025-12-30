import React from 'react';
import { ArrowRight, Activity, Shield, Zap } from 'lucide-react';

interface LandingPageProps {
    onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-medical-blue selection:text-white overflow-x-hidden">
            {/* Navigation */}
            <nav className="fixed w-full z-50 bg-white/70 backdrop-blur-lg border-b border-white/20">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-tr from-medical-blue to-medical-purple rounded-xl flex items-center justify-center shadow-lg shadow-medical-blue/20">
                            <span className="text-white font-bold text-xl">A</span>
                        </div>
                        <span className="text-slate-800 font-bold text-xl tracking-tight">AngioAI</span>
                    </div>
                    <button
                        onClick={onGetStarted}
                        className="px-6 py-2.5 rounded-full bg-slate-100 text-slate-600 font-medium hover:bg-slate-200 transition-all"
                    >
                        Login
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 relative overflow-hidden">
                <div className="bg-gradient-to-b from-medical-blue/5 to-transparent absolute inset-0 -z-10" />

                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-medical-blue text-sm font-semibold">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Next Generation Cardiology
                        </div>

                        <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                            Revolutionizing <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-medical-blue to-medical-purple">
                                Cardiac Care
                            </span>
                        </h1>

                        <p className="text-xl text-slate-600 max-w-lg leading-relaxed">
                            Advanced AI analytics for precise angiography interpretation.
                            Enhancing diagnostic accuracy and streamlining clinical workflows.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={onGetStarted}
                                className="px-8 py-4 rounded-full bg-slate-900 text-white font-semibold text-lg hover:bg-slate-800 hover:scale-105 transition-all shadow-xl shadow-blue-900/10 flex items-center gap-2 group"
                            >
                                Get Started
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="px-8 py-4 rounded-full bg-white text-slate-700 font-semibold text-lg border border-slate-200 hover:border-medical-blue/30 hover:bg-blue-50/50 transition-all">
                                View Demo
                            </button>
                        </div>

                        <div className="pt-8 flex items-center gap-8 text-slate-400">
                            <div className="flex items-center gap-2">
                                <Shield className="w-5 h-5" />
                                <span className="text-sm">HIPAA Compliant</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Zap className="w-5 h-5" />
                                <span className="text-sm">Real-time Analysis</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative lg:h-[600px] flex items-center justify-center">
                        {/* Abstract Backgrounds */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />

                        {/* 3D Heart Asset */}
                        <img
                            src="/assets/heart-hero.png"
                            alt="3D Cardiac Model"
                            className="relative z-10 w-full max-w-lg drop-shadow-2xl hover:scale-105 transition-transform duration-700 ease-out"
                        />

                        {/* Floating Cards */}
                        <div className="absolute top-20 right-10 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 animate-float-slow z-20">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <Activity className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Analysis Accuracy</p>
                                    <p className="text-lg font-bold text-slate-800">99.8%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: "AI Diagnostics", desc: "Automated lesion detection and stenosis quantification." },
                            { title: "Patient Timeline", desc: "Comprehensive history visualization for better context." },
                            { title: "Secure Cloud", desc: "Enterprise-grade security with instant global access." }
                        ].map((item, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-slate-50 hover:bg-white hover:shadow-xl hover:shadow-blue-900/5 transition-all border border-slate-100 group cursor-default">
                                <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r from-medical-blue to-medical-purple`} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                                <p className="text-slate-500 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
